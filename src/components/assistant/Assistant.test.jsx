// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen, cleanup, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

function sseResponse(events, { status = 200 } = {}) {
  const body = events.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join("")
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(body))
      controller.close()
    },
  })
  return new Response(stream, { status, headers: { "Content-Type": "text/event-stream" } })
}

const json = (obj, init = {}) => new Response(JSON.stringify(obj), { status: 200, headers: { "Content-Type": "application/json" }, ...init })

async function loadAssistant() {
  vi.resetModules()
  const mod = await import("./Assistant")
  return mod.default
}

async function openPanel() {
  await userEvent.click(screen.getByRole("button", { name: /ask the portfolio assistant/i }))
  return screen.getByRole("dialog", { name: /portfolio assistant/i })
}

beforeEach(() => {
  if (typeof window.matchMedia !== "function") {
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  }
  Element.prototype.scrollIntoView = () => {}
  sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("offline mode (no VITE_API_URL)", () => {
  it("opens with the greeting and prompts, answers from the scripted guide, closes and returns focus", async () => {
    const Assistant = await loadAssistant()
    render(<Assistant />)
    await openPanel()
    expect(screen.getByText(/Hi! I'm Aayush's Portfolio Assistant/)).toBeTruthy()
    expect(screen.getByRole("button", { name: "Explore my AI/ML projects." })).toBeTruthy()
    expect(screen.getByRole("button", { name: "How does Auralis work?" })).toBeTruthy()
    expect(screen.getByTestId("assistant-status").textContent).toMatch(/offline guide/)

    await userEvent.type(screen.getByRole("textbox", { name: /ask the portfolio assistant/i }), "tell me about deskguard{Enter}")
    expect(await screen.findByText("DeskGuard", {}, { timeout: 3000 })).toBeTruthy()
    expect(screen.getByText(/scripted guide · offline/)).toBeTruthy()

    await userEvent.click(screen.getByRole("button", { name: /close the portfolio assistant/i }))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /ask the portfolio assistant/i }))
  })

  it("takes project context from the open event and can drop it", async () => {
    const Assistant = await loadAssistant()
    render(<Assistant />)
    act(() => {
      window.dispatchEvent(new CustomEvent("assistant:open", { detail: { projectSlug: "auralis" } }))
    })
    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(screen.getByTestId("project-context").textContent).toContain("Auralis")
    expect(screen.getByRole("textbox").getAttribute("placeholder")).toMatch(/Auralis/)
    await userEvent.click(screen.getByRole("button", { name: /stop focusing on Auralis/i }))
    expect(screen.queryByTestId("project-context")).toBeNull()
  })

  it("ignores unknown project slugs in the open event", async () => {
    const Assistant = await loadAssistant()
    render(<Assistant />)
    act(() => {
      window.dispatchEvent(new CustomEvent("assistant:open", { detail: { projectSlug: "not-a-project" } }))
    })
    expect(screen.queryByTestId("project-context")).toBeNull()
  })
})

describe("live mode", () => {
  it("probes the API, streams the answer, swaps in the grounded final text and lists sources", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test")
    const fetchMock = vi.fn(async (url) => {
      if (String(url).endsWith("/api/v1/assistant/status")) return json({ live: true })
      return sseResponse([
        ["meta", { intent: "architecture_explanation", tools: ["get_project_architecture"], link_hosts: ["github.com"], evidence_count: 5 }],
        ["delta", { text: "Auralis runs a " }],
        ["delta", { text: "LangGraph pipeline [S1] see https://evil.example/x" }],
        ["final", { text: "Auralis runs a LangGraph pipeline [S1].", grounding_dropped: 1 }],
        ["sources", [{ id: "S1", title: "Architecture", url: "https://github.com/aayush2724/Auralis/blob/abc/README.md#architecture", kind: "readme" }]],
        ["done", { message_id: "m1", outcome: "ok" }],
      ])
    })
    vi.stubGlobal("fetch", fetchMock)
    const Assistant = await loadAssistant()
    render(<Assistant />)
    await openPanel()
    expect(await screen.findByText(/live · grounded/)).toBeTruthy()

    await userEvent.type(screen.getByRole("textbox"), "Explain the architecture of Auralis{Enter}")
    expect(await screen.findByText(/Auralis runs a LangGraph pipeline/)).toBeTruthy()
    expect(screen.queryByText(/evil\.example/)).toBeNull() // the final text replaced the raw stream
    const link = await screen.findByRole("link", { name: "Architecture" })
    expect(link.getAttribute("href")).toBe("https://github.com/aayush2724/Auralis/blob/abc/README.md#architecture")

    const chatCall = fetchMock.mock.calls.find((c) => String(c[0]).endsWith("/api/v1/assistant/chat"))
    const body = JSON.parse(chatCall[1].body)
    expect(body.message).toBe("Explain the architecture of Auralis")
    expect(body.session_id).toMatch(/^[0-9a-f-]{36}$/)
    expect(body.project_slug).toBeNull()
  })

  it("falls back to the scripted guide when the network fails, and stays offline", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test")
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        if (String(url).endsWith("/api/v1/assistant/status")) return json({ live: true })
        throw new TypeError("network down")
      })
    )
    const Assistant = await loadAssistant()
    render(<Assistant />)
    await openPanel()
    await screen.findByText(/live · grounded/)
    await userEvent.type(screen.getByRole("textbox"), "tell me about deskguard{Enter}")
    expect(await screen.findByText(/couldn't reach the live assistant/, {}, { timeout: 3000 })).toBeTruthy()
    expect(screen.getByTestId("assistant-status").textContent).toMatch(/offline guide/)
  })

  it("explains a rate limit instead of failing silently", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test")
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        if (String(url).endsWith("/api/v1/assistant/status")) return json({ live: true })
        return json({ error: { code: "rate_limited", message: "Too many" } }, { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "42" } })
      })
    )
    const Assistant = await loadAssistant()
    render(<Assistant />)
    await openPanel()
    await screen.findByText(/live · grounded/)
    await userEvent.type(screen.getByRole("textbox"), "hello{Enter}")
    expect(await screen.findByText(/getting a lot of questions.*42 seconds/)).toBeTruthy()
  })

  it("reports offline when the status probe says the assistant is not configured", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test")
    vi.stubGlobal("fetch", vi.fn(async () => json({ live: false, reason: "not_configured" })))
    const Assistant = await loadAssistant()
    render(<Assistant />)
    await openPanel()
    expect(await screen.findByText(/offline guide/)).toBeTruthy()
  })
})

describe("cold start and offline context", () => {
  it("keeps probing while the API wakes up, then goes live", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test")
    let calls = 0
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        calls += 1
        if (calls === 1) throw new TypeError("connection refused")
        if (calls === 2) return json({ error: "booting" }, { status: 503, headers: { "Content-Type": "application/json" } })
        return json({ live: true })
      })
    )
    const Assistant = await loadAssistant()
    render(<Assistant probeDelays={[30, 30, 30]} probeTimeoutMs={200} />)
    await openPanel()
    expect(await screen.findByText(/waking the assistant up/)).toBeTruthy()
    expect(screen.getByRole("button", { name: "How does Auralis work?" }).disabled).toBe(true)
    expect(await screen.findByText(/live · grounded/)).toBeTruthy()
    expect(calls).toBe(3)
  })

  it("falls back to the scripted guide only after the retries run out", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test")
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("down") }))
    const Assistant = await loadAssistant()
    render(<Assistant probeDelays={[20, 20]} probeTimeoutMs={100} />)
    await openPanel()
    expect(await screen.findByText(/offline guide/)).toBeTruthy()
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it("answers offline questions about the project the visitor came from", async () => {
    const Assistant = await loadAssistant()
    render(<Assistant />)
    act(() => {
      window.dispatchEvent(new CustomEvent("assistant:open", { detail: { projectSlug: "deskguard" } }))
    })
    await userEvent.type(screen.getByRole("textbox"), "how does it work?{Enter}")
    expect(await screen.findByText("DeskGuard", {}, { timeout: 3000 })).toBeTruthy()
  })
})

describe("free-tier refusals", () => {
  it("answers from the scripted guide when the free model refuses the request", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test")
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        if (String(url).endsWith("/api/v1/assistant/status")) return json({ live: true })
        return sseResponse([
          ["meta", { intent: "project_explanation", tools: ["get_project_details"], link_hosts: ["github.com"] }],
          ["error", { code: "llm_rate_limited", message: "busy" }],
          ["done", { outcome: "error" }],
        ])
      })
    )
    const Assistant = await loadAssistant()
    render(<Assistant />)
    await openPanel()
    await screen.findByText(/live · grounded/)
    await userEvent.type(screen.getByRole("textbox"), "tell me about deskguard{Enter}")
    expect(await screen.findByText(/reached its free usage limit/, {}, { timeout: 3000 })).toBeTruthy()
    expect(await screen.findByText("DeskGuard", {}, { timeout: 3000 })).toBeTruthy()
    expect(screen.queryByText("busy")).toBeNull()
    // A quota refusal is temporary: the next question still tries the live assistant.
    expect(screen.getByTestId("assistant-status").textContent).toMatch(/live · grounded/)
  })

  it("stays offline for the visit when the model is unavailable", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test")
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        if (String(url).endsWith("/api/v1/assistant/status")) return json({ live: true })
        return sseResponse([["error", { code: "llm_unavailable", message: "gone" }], ["done", { outcome: "error" }]])
      })
    )
    const Assistant = await loadAssistant()
    render(<Assistant />)
    await openPanel()
    await screen.findByText(/live · grounded/)
    await userEvent.type(screen.getByRole("textbox"), "hello there{Enter}")
    expect(await screen.findByText(/scripted guide · offline/, {}, { timeout: 3000 })).toBeTruthy()
    expect(screen.getByTestId("assistant-status").textContent).toMatch(/offline guide/)
  })
})
