import { useEffect, useRef, useState } from "react"
import Message from "./Message"

const STATUS = {
  live: { dot: "var(--ok)", text: "live · grounded in the repositories" },
  offline: { dot: "var(--muted)", text: "offline guide · scripted" },
  unknown: { dot: "var(--muted)", text: "connecting…" },
}

/**
 * The chat panel. Non-modal (the page stays usable), closes on Escape, and
 * scrolls its own log: min-h-0 lets the flex item shrink, data-lenis-prevent
 * keeps the wheel on the log instead of the page behind it.
 */
export default function Panel({ open, onClose, messages, busy, waking, mode, greeting, suggestions, projectName, onClearProject, onSend, onClear }) {
  const [input, setInput] = useState("")
  const inputRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" })
  }, [messages, open, busy])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  // While the first probe runs (or the API wakes) questions wait; typing still works.
  const connecting = mode === "unknown"
  const submit = () => {
    const text = input.trim()
    if (!text || busy || connecting) return
    setInput("")
    onSend(text)
  }
  const status = waking ? { dot: "var(--ember)", text: "waking the assistant up (free hosting naps)…" } : STATUS[mode] || STATUS.unknown

  return (
    <div
      id="portfolio-assistant"
      role="dialog"
      aria-label="Portfolio assistant"
      className="fixed right-5 w-[400px] max-w-[92vw] z-[120] rounded-2xl border border-white/8 bg-[var(--bg)] shadow-2xl shadow-black/60 overflow-hidden flex flex-col"
      style={{ maxHeight: "min(600px, 80vh)", bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 bg-white/[0.02] flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent)" }}>
            <span className="text-[10px] font-bold" style={{ color: "var(--accent-ink)" }}>{">_"}</span>
          </div>
          <div className="min-w-0">
            <div className="font-display text-sm font-semibold" style={{ color: "var(--fg)" }}>Portfolio Assistant</div>
            <div className="font-mono text-[9px] flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "var(--muted)" }} data-testid="assistant-status">
              <span className="w-1 h-1 rounded-full animate-pulse flex-shrink-0" style={{ background: status.dot }} />
              {status.text}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button aria-label="Clear conversation" onClick={() => { onClear(); setInput("") }} className="font-mono text-[10px] hover:opacity-70 transition-opacity px-2 py-1 rounded border border-white/6" style={{ color: "var(--muted)" }}>
            clear
          </button>
          {/* Close from where you are: on desktop the launcher is gone (the
              dock opens the panel), so the panel carries its own way out. */}
          <button
            aria-label="Hide the assistant panel"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded border border-white/6 transition-colors hover:text-[var(--fg)]"
            style={{ color: "var(--muted)" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {projectName && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/6 flex-shrink-0" data-testid="project-context">
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>talking about</span>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "rgb(var(--accent-rgb) / 0.12)", color: "var(--accent)", border: "1px solid rgb(var(--accent-rgb) / 0.3)" }}>
            {projectName}
          </span>
          <button onClick={onClearProject} aria-label={`Stop focusing on ${projectName}`} className="ml-auto font-mono text-[10px] hover:opacity-70" style={{ color: "var(--muted)" }}>
            ×
          </button>
        </div>
      )}

      <div role="log" aria-live="polite" data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 font-body" style={{ scrollbarWidth: "thin" }}>
        {messages.length === 0 && (
          <div className="py-3">
            <p className="text-sm leading-relaxed" style={{ color: "var(--fg)" }}>{greeting}</p>
          </div>
        )}
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>

      {messages.length === 0 && (
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button key={s} onClick={() => onSend(s)} disabled={connecting} className="font-mono text-[10px] px-2.5 py-1 rounded-full transition-all hover:border-[var(--accent)] disabled:opacity-40 disabled:cursor-wait" style={{ border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted)" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-3 pb-3 flex-shrink-0 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex gap-2 items-center rounded-xl px-3 py-2 transition-all" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <input
            ref={inputRef}
            aria-label="Ask the portfolio assistant a question"
            autoComplete="off"
            maxLength={800}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={projectName ? `Ask about ${projectName}…` : "Ask about a project, a decision, a technology…"}
            disabled={busy}
            className="flex-1 bg-transparent font-body text-sm outline-none placeholder:opacity-60 disabled:opacity-50"
            style={{ color: "var(--fg)" }}
          />
          <button aria-label="Send message" onClick={submit} disabled={busy || connecting || !input.trim()} className="flex-shrink-0 w-7 h-7 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6L11 6M6 1L11 6L6 11" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
