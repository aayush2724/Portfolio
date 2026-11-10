import { forwardRef, useEffect, useState } from "react"

/**
 * The floating launcher — phones and small tablets only; from md up the
 * assistant opens from the bottom dock (Dock.jsx). On phones it steps out of the way while the 3D room
 * (#hq) fills the screen so it never sits on the room or its door rail; it
 * stays put while the panel is open.
 */
const Launcher = forwardRef(function Launcher({ open, onToggle }, ref) {
  const [overMap, setOverMap] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined
    const mq = window.matchMedia("(max-width: 767px)")
    let io = null
    const bind = () => {
      io?.disconnect()
      io = null
      setOverMap(false)
      const hq = document.getElementById("hq")
      if (!mq.matches || !hq || typeof IntersectionObserver === "undefined") return
      io = new IntersectionObserver(
        ([e]) => setOverMap(e.intersectionRatio >= 0.5 || e.intersectionRect.height >= window.innerHeight * 0.6),
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      )
      io.observe(hq)
    }
    bind()
    mq.addEventListener?.("change", bind)
    return () => {
      mq.removeEventListener?.("change", bind)
      io?.disconnect()
    }
  }, [])
  const tucked = overMap && !open

  return (
    <button
      ref={ref}
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="portfolio-assistant"
      aria-label={open ? "Close the portfolio assistant" : "Ask the portfolio assistant"}
      tabIndex={tucked ? -1 : 0}
      className="fixed right-5 z-50 inline-flex items-center gap-2 md:hidden rounded-full border border-black/10 p-3.5 md:px-4 md:py-3 text-sm font-display font-semibold transition-all duration-300 hover:-translate-y-1 shadow-2xl"
      style={{
        background: "var(--accent)",
        color: "var(--accent-ink)",
        boxShadow: "0 0 20px rgb(var(--accent-rgb) / 0.2)",
        bottom: "calc(1.25rem + env(safe-area-inset-bottom))",
        transform: tucked ? "translateY(calc(100% + 2rem))" : undefined,
        pointerEvents: tucked ? "none" : undefined,
      }}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-black/40 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-black/60" />
      </span>
      <span className="hidden md:inline">{open ? "Close" : "Ask me"}</span>
    </button>
  )
})

export default Launcher
