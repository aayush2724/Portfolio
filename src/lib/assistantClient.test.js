import { describe, it, expect } from "vitest"
import { parseSse, isConfigured } from "./assistantClient"

describe("assistant client", () => {
  it("is offline when VITE_API_URL is unset", () => {
    expect(isConfigured()).toBe(false)
  })

  it("parses complete SSE events and keeps the partial remainder", () => {
    const chunk = 'event: meta\ndata: {"intent":"x"}\n\n: keep-alive\n\nevent: delta\ndata: {"text":"Hel'
    const { events, rest } = parseSse(chunk)
    expect(events).toEqual([{ event: "meta", data: { intent: "x" } }])
    expect(rest).toBe('event: delta\ndata: {"text":"Hel')
    const more = parseSse(rest + 'lo"}\n\nevent: done\ndata: {}\n\n')
    expect(more.events.map((e) => e.event)).toEqual(["delta", "done"])
    expect(more.events[0].data.text).toBe("Hello")
    expect(more.rest).toBe("")
  })

  it("keeps non-JSON data as a string", () => {
    const { events } = parseSse("data: plain\n\n")
    expect(events[0]).toEqual({ event: "message", data: "plain" })
  })
})
