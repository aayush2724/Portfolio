export default function CommandLabel({ children, className = "" }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 font-mono text-xs ${className}`}
    >
      <span className="text-[var(--accent)]">$</span>
      <span className="text-[var(--muted)]">{children}</span>
    </div>
  )
}
