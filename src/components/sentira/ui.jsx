import { ArrowRight } from "lucide-react"

/**
 * The shared vocabulary of the Sentira system. Four pieces do almost all the
 * work on the page, so they live together — seeing them side by side is what
 * keeps the chip, the pill and the heading on one scale.
 */

/**
 * The logo glyph: a ring with a faded trailing arc, struck through on the
 * diagonal. Inline rather than an <img> because it appears at four sizes (nav,
 * footer, chip, CTA) and has to inherit currentColor in each.
 */
export function Mark({ size = 22, className = "", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3a9 9 0 0 1 0 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M6.5 17.5 17.5 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  )
}

/**
 * The eyebrow that opens every section: a small raised slab carrying the green
 * mark and a label. Besides the terrain this is the only place the accent
 * appears, which is what makes it register as a wayfinding device rather than
 * as decoration.
 */
export function Chip({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-chip px-3 py-1.5 text-[13px] leading-none ${className}`}
      style={{ background: "var(--surface-2)", color: "var(--fg)" }}
    >
      <Mark size={13} className="shrink-0" style={{ color: "var(--accent)" }} />
      {children}
    </span>
  )
}

/**
 * Buttons. `solid` is the white pill that carries every primary action in the
 * reference; `ghost` is the raised dark pill, and it is the only one that takes
 * the circular arrow badge.
 */
export function Pill({
  as = "button",
  variant = "solid",
  arrow = false,
  className = "",
  children,
  ...props
}) {
  const Tag = as
  const solid = variant === "solid"

  return (
    <Tag
      className={`group inline-flex items-center gap-2.5 rounded-pill text-[15px] leading-none transition-all duration-300 ${
        arrow ? "py-2 pl-5 pr-2" : "px-5 py-3"
      } ${className}`}
      style={
        solid
          ? { background: "var(--invert-bg)", color: "var(--invert-fg)" }
          : { background: "var(--surface-2)", color: "var(--fg)" }
      }
      {...props}
    >
      {/* inline-flex + nowrap: callers pass an icon alongside the label, and a
          plain inline span lets the two break onto separate lines inside the
          pill as soon as the row gets tight. */}
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap ${
          arrow ? "py-1" : ""
        }`}
      >
        {children}
      </span>
      {arrow && (
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5"
          style={{
            background: solid ? "var(--invert-fg)" : "var(--invert-bg)",
            color: solid ? "var(--invert-bg)" : "var(--invert-fg)",
          }}
        >
          <ArrowRight size={14} strokeWidth={2.2} />
        </span>
      )}
    </Tag>
  )
}

/**
 * A section's chip + serif headline. `align="center"` is the reference's
 * default for full-bleed sections; the left variant is used wherever a CTA sits
 * opposite the heading.
 *
 * `lines` is an array so each line breaks exactly where the design wants it
 * rather than wherever the container happens to wrap.
 */
export function SectionHead({
  label,
  lines,
  align = "center",
  className = "",
  size = "text-[34px] sm:text-5xl md:text-[56px]",
}) {
  const centered = align === "center"

  return (
    <div
      className={`flex flex-col ${
        centered ? "items-center text-center" : "items-start text-left"
      } ${className}`}
    >
      {label && <Chip className="mb-6">{label}</Chip>}
      <h2 className={`font-display leading-[1.08] ${size}`}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </h2>
    </div>
  )
}

/** The hairline-bordered surface every card in the system is built on. */
export function Card({ className = "", style, children, ...props }) {
  return (
    <div
      className={`rounded-card border ${className}`}
      style={{
        background: "var(--surface)",
        borderColor: "var(--line)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/** A small pass-through tag, used for the tech labels beside service rows. */
export function Tag({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-chip px-3 py-1.5 text-[13px] leading-none ${className}`}
      style={{ background: "var(--surface-2)", color: "var(--muted)" }}
    >
      {children}
    </span>
  )
}
