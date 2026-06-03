import { motion } from "framer-motion"

export default function DownloadResumeButton({ className = "", variant = "primary" }) {
  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a')
    link.href = '/resume.pdf'
    link.download = 'Aayush_Kumar_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={handleDownload}
        className={`inline-flex items-center gap-2 font-mono text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)] ${className}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Resume</span>
      </button>
    )
  }

  if (variant === "outline") {
    return (
      <motion.button
        onClick={handleDownload}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/50 px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] ${className}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Download Resume</span>
      </motion.button>
    )
  }

  // Primary variant (default)
  return (
    <motion.button
      onClick={handleDownload}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-3 rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent-ink)] shadow-lg shadow-[var(--accent)]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--accent)]/30 ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>Download Resume</span>
    </motion.button>
  )
}
