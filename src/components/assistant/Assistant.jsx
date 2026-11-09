import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import Launcher from "./Launcher"
import Panel from "./Panel"
import { ASSISTANT_OPEN_EVENT } from "../../lib/assistantEvents"
import { getSessionId } from "../../lib/session"
import { AssistantApiError, isConfigured, probeStatus, streamChat } from "../../lib/assistantClient"
import { searchPortfolio } from "../../lib/portfolioScript"
import { PROJECT_SLUGS } from "../../data/projectSlugs"

export const GREETING =
  "Hi! I'm Aayush's Portfolio Assistant. I can help you explore his projects, understand his technical decisions, and learn more about his engineering experience. What would you like to explore?"

export const SUGGESTED_PROMPTS = [
  "Explore my AI/ML projects.",
  "Explain my backend engineering work.",
  "How does Auralis work?",
  "Explore my GitHub repositories.",
  "What technologies have I worked with?",
]

const WAKE_HINT_MS = 4000

// A sleeping Render free instance takes 30–60 s to answer. The first-open probe
// keeps trying for about a minute (showing "waking up") before falling back.
const PROBE_DELAYS_MS = [1500, 3000, 5000, 8000, 10000, 10000, 10000, 10000]
const PROBE_TIMEOUT_MS = 8000
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let counter = 0
const nextId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`

function patch(state, id, fn) {
  return { ...state, messages: state.messages.map((m) => (m.id === id ? fn(m) : m)) }
}

function reducer(state, action) {
  switch (action.type) {
    case "mode":
      return { ...state, mode: action.mode, waking: false }
    case "waking":
      return { ...state, waking: action.value }
    case "user":
      return { ...state, busy: true, messages: [...state.messages, { id: action.id, role: "user", text: action.text, status: "done" }] }
    case "assistant_start":
      return { ...state, messages: [...state.messages, { id: action.id, role: "assistant", text: "", status: "streaming", sources: [], meta: null, offline: Boolean(action.offline) }] }
    case "meta":
      return patch(state, action.id, (m) => ({ ...m, meta: action.meta }))
    case "delta":
      return patch(state, action.id, (m) => ({ ...m, text: m.text + action.text }))
    case "final":
      return patch(state, action.id, (m) => ({ ...m, text: action.text }))
    case "sources":
      return patch(state, action.id, (m) => ({ ...m, sources: action.sources }))
    case "done":
      return { ...patch(state, action.id, (m) => ({ ...m, status: "done", messageId: action.messageId ?? m.messageId, offline: action.offline ?? m.offline })), busy: false, waking: false }
    case "error":
      return { ...patch(state, action.id, (m) => ({ ...m, status: "error", text: action.text ?? m.text, errorCode: action.code })), busy: false, waking: false }
    case "reset":
      return { ...state, messages: [], busy: false, waking: false }
    default:
      return state
  }
}

const initialState = () => ({ messages: [], mode: isConfigured() ? "unknown" : "offline", waking: false, busy: false })

/**
 * The portfolio assistant: a floating launcher and a chat panel.
 *
 * Live mode streams grounded answers from the backend API. If the API is not
 * configured, unreachable, or resting for the day, the panel answers from the
 * site's scripted guide instead — the visitor always gets an answer, and the
 * header says which mode they are in. Other components open it by dispatching
 * the `assistant:open` event with an optional project slug and prompt.
 */
export default function Assistant({ probeDelays = PROBE_DELAYS_MS, probeTimeoutMs = PROBE_TIMEOUT_MS }) {
  const [open, setOpen] = useState(false)
  const [projectSlug, setProjectSlug] = useState(null)
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const toggleRef = useRef(null)
  const wasOpen = useRef(false)
  const abortRef = useRef(null)
  const pendingPrompt = useRef(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Focus goes back to the launcher when the panel closes.
  useEffect(() => {
    if (open) wasOpen.current = true
    else if (wasOpen.current) {
      wasOpen.current = false
      toggleRef.current?.focus()
    }
  }, [open])

  // First open probes the API, which also wakes a sleeping free-tier instance.
  // Timeouts, network errors and 5xx mean "still waking": retry with backoff,
  // and only fall back to the scripted guide once the delays run out.
  useEffect(() => {
    if (!open || state.mode !== "unknown") return undefined
    let cancelled = false
    const controller = new AbortController()
    ;(async () => {
      for (let attempt = 0; !cancelled; attempt++) {
        try {
          const s = await probeStatus({ signal: controller.signal, timeoutMs: probeTimeoutMs })
          if (cancelled) return
          if (!s.retry) {
            dispatch({ type: "mode", mode: s.live ? "live" : "offline" })
            return
          }
        } catch {
          if (cancelled) return
        }
        if (attempt >= probeDelays.length) {
          dispatch({ type: "mode", mode: "offline" })
          return
        }
        dispatch({ type: "waking", value: true })
        await sleep(probeDelays[attempt])
      }
    })()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [open, state.mode, probeDelays, probeTimeoutMs])

  const scriptedReply = useCallback((id, text, prefix = "", slug = null) => {
    // The scripted guide matches on keywords, so a question asked from a project
    // card ("how does it work?") carries the project's name with it.
    const name = slug ? PROJECT_SLUGS[slug]?.name : null
    const reply = searchPortfolio(name && !text.toLowerCase().includes(name.toLowerCase()) ? `${name} ${text}` : text)
    setTimeout(() => {
      dispatch({ type: "final", id, text: prefix + reply })
      dispatch({ type: "done", id, offline: true })
    }, 450)
  }, [])

  const send = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed || stateRef.current.busy || stateRef.current.mode === "unknown") return
      const userId = nextId()
      const replyId = nextId()
      dispatch({ type: "user", id: userId, text: trimmed })
      const current = stateRef.current
      if (current.mode !== "live") {
        dispatch({ type: "assistant_start", id: replyId, offline: true })
        scriptedReply(replyId, trimmed, "", projectSlug)
        return
      }
      dispatch({ type: "assistant_start", id: replyId })
      const history = current.messages
        .filter((m) => m.status === "done" && m.text)
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.text.slice(0, 4000) }))
      const controller = new AbortController()
      abortRef.current = controller
      const wakeTimer = setTimeout(() => dispatch({ type: "waking", value: true }), WAKE_HINT_MS)
      let finished = false
      try {
        for await (const ev of streamChat({
          sessionId: getSessionId(),
          message: trimmed,
          projectSlug,
          history,
          signal: controller.signal,
          onFirstByte: () => {
            clearTimeout(wakeTimer)
            dispatch({ type: "waking", value: false })
          },
        })) {
          if (ev.event === "meta") dispatch({ type: "meta", id: replyId, meta: ev.data })
          else if (ev.event === "delta") dispatch({ type: "delta", id: replyId, text: ev.data?.text || "" })
          else if (ev.event === "final") dispatch({ type: "final", id: replyId, text: ev.data?.text || "" })
          else if (ev.event === "sources") dispatch({ type: "sources", id: replyId, sources: Array.isArray(ev.data) ? ev.data : [] })
          else if (ev.event === "done") {
            finished = true
            dispatch({ type: "done", id: replyId, messageId: ev.data?.message_id })
          } else if (ev.event === "error") {
            finished = true
            // The free model is rate-limited per account; a refused, failed or timed-out model call
            // should not leave the visitor with an error. Answer from the scripted guide instead.
            const code = ev.data?.code
            if (code === "llm_unavailable") dispatch({ type: "mode", mode: "offline" })
            const why = code === "llm_rate_limited" || code === "llm_unavailable"
              ? "The live assistant has reached its free usage limit for now"
              : "The live assistant couldn't finish that answer"
            scriptedReply(replyId, trimmed, `${why}, so here is the scripted guide's answer:\n\n`, projectSlug)
          }
        }
        if (!finished) dispatch({ type: "done", id: replyId })
      } catch (err) {
        clearTimeout(wakeTimer)
        if (err?.name === "AbortError") return
        if (err instanceof AssistantApiError) {
          if (err.status === 429) {
            const wait = err.retryAfter ? ` Try again in about ${err.retryAfter > 90 ? Math.round(err.retryAfter / 60) + " minutes" : err.retryAfter + " seconds"}.` : " Try again in a moment."
            dispatch({ type: "error", id: replyId, code: err.code, text: `I'm getting a lot of questions right now.${wait}` })
            return
          }
          if (err.code === "budget_exhausted") {
            scriptedReply(replyId, trimmed, "The live assistant is resting for today (daily budget reached). Here is the scripted guide's answer instead:\n\n", projectSlug)
            return
          }
          if (err.code === "assistant_offline" || err.status >= 500) {
            dispatch({ type: "mode", mode: "offline" })
            scriptedReply(replyId, trimmed, "The live assistant is unavailable right now, so here is the scripted guide's answer:\n\n", projectSlug)
            return
          }
          dispatch({ type: "error", id: replyId, code: err.code, text: err.message || "The assistant could not answer that." })
          return
        }
        // Network failure or a sleeping instance that never woke: fall back, and stay offline for this visit.
        dispatch({ type: "mode", mode: "offline" })
        scriptedReply(replyId, trimmed, "I couldn't reach the live assistant, so here is the scripted guide's answer:\n\n", projectSlug)
      } finally {
        clearTimeout(wakeTimer)
        if (abortRef.current === controller) abortRef.current = null
      }
    },
    [projectSlug, scriptedReply]
  )

  // Entry points elsewhere on the site: project cards, case-study pages, the shell.
  useEffect(() => {
    const onOpen = (e) => {
      const detail = e.detail || {}
      if (detail.projectSlug && PROJECT_SLUGS[detail.projectSlug]) setProjectSlug(detail.projectSlug)
      if (detail.prompt) pendingPrompt.current = String(detail.prompt).slice(0, 800)
      setOpen(true)
    }
    window.addEventListener(ASSISTANT_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, onOpen)
  }, [])

  // A prompt handed over with the open event is sent once the mode is known.
  useEffect(() => {
    if (!open || !pendingPrompt.current || state.mode === "unknown" || state.busy) return
    const prompt = pendingPrompt.current
    pendingPrompt.current = null
    send(prompt)
  }, [open, state.mode, state.busy, send])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    dispatch({ type: "reset" })
  }, [])

  return (
    <div>
      <Launcher ref={toggleRef} open={open} onToggle={() => setOpen((o) => !o)} />
      <Panel
        open={open}
        onClose={() => setOpen(false)}
        messages={state.messages}
        busy={state.busy}
        waking={state.waking}
        mode={state.mode}
        greeting={GREETING}
        suggestions={SUGGESTED_PROMPTS}
        projectName={projectSlug ? PROJECT_SLUGS[projectSlug]?.name : null}
        onClearProject={() => setProjectSlug(null)}
        onSend={send}
        onClear={reset}
      />
    </div>
  )
}
