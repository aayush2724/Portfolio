import { motion } from "framer-motion"
import MagneticButton from "./MagneticButton"

/**
 * The resume is a file, so every variant is a real <a download> — it works
 * without JavaScript, shows the destination on hover/long-press, and reads to
 * assistive tech as a link rather than a button that happens to navigate.
 */
const HREF = "/resume.pdf"
const FILENAME = "Aayush_Kumar_Resume.pdf"

function Icon({ size = 16, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

export default function DownloadResumeButton({ className = "", variant = "primary" }) {
  if (variant === "minimal") {
    return (
      <a
        href={HREF}
        download={FILENAME}
        className={`inline-flex items-center gap-2 font-mono text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)] ${className}`}
      >
        <Icon />
        <span>Resume</span>
      </a>
    )
  }

  if (variant === "outline") {
    return (
      <motion.a
        href={HREF}
        download={FILENAME}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/50 px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] ${className}`}
      >
        <Icon />
        <span>Download Resume</span>
      </motion.a>
    )
  }

  // Primary variant (default)
  return (
    <MagneticButton
      as={motion.a}
      href={HREF}
      download={FILENAME}
      className={`glow-pill inline-flex items-center gap-3 rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent-ink)] transition-all duration-300 ${className}`}
    >
      <Icon size={18} strokeWidth={2.5} />
      <span>Download Resume</span>
    </MagneticButton>
  )
}
