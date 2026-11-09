/**
 * Browser client for the assistant API: a status probe and a streamed chat.
 * The API origin comes from VITE_API_URL at build time; when it is unset the
 * assistant runs in its scripted offline mode and this module is never hit.
 */
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")

export const isConfigured = () => API_URL.length > 0

export class AssistantApiError extends Error {
  constructor(status, code, message, retryAfter = null) {
    super(message || code || `HTTP ${status}`)
    this.name = "AssistantApiError"
    this.status = status
    this.code = code
    this.retryAfter = retryAfter
  }
}

/**
 * Parse as many complete SSE events as `buffer` holds. Returns the events and
 * the unparsed remainder (a partial event waiting for more bytes).
 */
export function parseSse(buffer) {
  const events = []
  let rest = buffer
  for (;;) {
    const idx = rest.indexOf("\n\n")
    if (idx < 0) break
    const block = rest.slice(0, idx)
    rest = rest.slice(idx + 2)
    let event = "message"
    const data = []
    for (const line of block.split("\n")) {
      if (!line || line.startsWith(":")) continue
      if (line.startsWith("event:")) event = line.slice(6).trim()
      else if (line.startsWith("data:")) data.push(line.slice(5).trimStart())
    }
    if (!data.length) continue
    const raw = data.join("\n")
    let parsed = raw
    try {
      parsed = JSON.parse(raw)
    } catch {
      /* keep the raw string */
    }
    events.push({ event, data: parsed })
  }
  return { events, rest }
}

export async function probeStatus({ signal, timeoutMs = 8000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const onAbort = () => controller.abort()
  signal?.addEventListener("abort", onAbort)
  try {
    const res = await fetch(`${API_URL}/api/v1/assistant/status`, { signal: controller.signal })
    // 5xx while a free-tier instance boots: the caller retries. 4xx: genuinely unavailable.
    if (res.status >= 500) return { live: false, retry: true, reason: `http_${res.status}` }
    if (!res.ok) return { live: false, reason: `http_${res.status}` }
    const body = await res.json()
    return { live: Boolean(body.live), reason: body.reason || null }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener("abort", onAbort)
  }
}

/**
 * POST a chat turn and yield SSE events {event, data} as they arrive.
 * Throws AssistantApiError for non-2xx responses (before any event).
 */
export async function* streamChat({ sessionId, message, projectSlug = null, history = [], signal, onFirstByte }) {
  const res = await fetch(`${API_URL}/api/v1/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ session_id: sessionId, message, project_slug: projectSlug, history }),
    signal,
  })
  if (!res.ok) {
    let body = null
    try {
      body = await res.json()
    } catch {
      /* non-JSON error body */
    }
    const retry = Number(res.headers.get("Retry-After"))
    throw new AssistantApiError(res.status, body?.error?.code || "http_error", body?.error?.message || res.statusText, Number.isFinite(retry) && retry > 0 ? retry : null)
  }
  onFirstByte?.()
  if (!res.body) {
    const { events } = parseSse((await res.text()) + "\n\n")
    for (const ev of events) yield ev
    return
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parsed = parseSse(buffer)
    buffer = parsed.rest
    for (const ev of parsed.events) yield ev
  }
  buffer += decoder.decode()
  if (buffer.trim()) {
    const { events } = parseSse(buffer + "\n\n")
    for (const ev of events) yield ev
  }
}
