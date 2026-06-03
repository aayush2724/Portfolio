export default function AsciiBox({ label, children, className = "" }) {
  return (
    <div
      className={`relative rounded-lg border border-[var(--line)] bg-[var(--surface)]/60 p-5 ${className}`}
    >
      {label && (
        <span className="absolute -top-2.5 left-4 bg-[var(--bg)] px-2 font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}
