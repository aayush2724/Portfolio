import { safeHref } from "../../lib/safeUrl"

const KIND_LABEL = { readme: "README", project: "project", portfolio_copy: "portfolio", portfolio: "portfolio", knowledge: "record", skill: "evidence" }

/** The evidence an answer rests on: README sections at a commit, project records, portfolio copy. */
export default function Sources({ items }) {
  if (!items?.length) return null
  return (
    <div className="mt-3 border-t pt-2" style={{ borderColor: "var(--line)" }}>
      <div className="font-mono text-[9px] uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>
        Sources
      </div>
      <ol className="space-y-1">
        {items.map((s) => {
          const href = safeHref(s.url)
          const label = s.title || s.url
          return (
            <li key={s.id || s.url} className="flex items-start gap-2 text-[11px] leading-snug">
              <span className="shrink-0 font-mono" style={{ color: "var(--accent)" }}>
                {s.id}
              </span>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--accent)]/40 underline-offset-2 hover:decoration-[var(--accent)] break-words" style={{ color: "var(--fg)" }}>
                  {label}
                </a>
              ) : (
                <span style={{ color: "var(--fg)" }}>{label}</span>
              )}
              {s.kind && (
                <span className="shrink-0 font-mono text-[9px]" style={{ color: "var(--muted)" }}>
                  {KIND_LABEL[s.kind] || s.kind}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
