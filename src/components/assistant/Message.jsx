import { renderMarkdown } from "../GithubReadme"
import Sources from "./Sources"

const AVATAR = (
  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold mr-2 flex-shrink-0 mt-0.5" style={{ background: "rgb(var(--accent-rgb) / 0.1)", color: "var(--accent)" }} aria-hidden="true">
    {">_"}
  </div>
)

function Typing() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1" aria-label="Thinking">
      {[0, 0.15, 0.3].map((d, i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--muted)", animation: `bot-typing 1s ${d}s infinite` }} />
      ))}
    </span>
  )
}

/**
 * One chat bubble. Assistant text is Markdown rendered through the site's
 * safe renderer with images off and links limited to the hosts the evidence
 * came from, so nothing an answer contains can load a tracker or point away
 * from the repositories.
 */
export default function Message({ message }) {
  const isUser = message.role === "user"
  const streaming = message.status === "streaming"
  const linkHosts = message.offline ? null : message.meta?.link_hosts || ["github.com", typeof window !== "undefined" ? window.location.hostname : "localhost"]
  const body =
    isUser ? (
      <div className="whitespace-pre-wrap font-body text-sm leading-relaxed">{message.text}</div>
    ) : message.text ? (
      <div className="assistant-md text-sm leading-relaxed">
        {renderMarkdown(message.text, { base: typeof window !== "undefined" ? window.location.origin : "https://aayush-2724.vercel.app/", images: false, linkHosts, headingShift: 2 })}
        {streaming && <span className="ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.15em] animate-pulse align-baseline" style={{ background: "var(--accent)" }} />}
      </div>
    ) : (
      <Typing />
    )

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`} data-role={message.role} data-status={message.status}>
      {!isUser && AVATAR}
      <div
        className={`max-w-[86%] rounded-xl px-3.5 py-2.5 ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
        style={{
          background: isUser ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${message.status === "error" ? "rgb(var(--ember-rgb) / 0.5)" : isUser ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
          color: isUser ? "var(--fg)" : "var(--muted)",
        }}
      >
        {body}
        {!isUser && message.status !== "streaming" && <Sources items={message.sources} />}
        {!isUser && message.offline && message.status === "done" && (
          <div className="mt-2 font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            scripted guide · offline
          </div>
        )}
      </div>
    </div>
  )
}
