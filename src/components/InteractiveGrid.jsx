import { useEffect, useRef } from "react"

export default function InteractiveGrid() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    // skip the cursor reveal on touch + reduced-motion
    const noHover = window.matchMedia("(pointer: coarse)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (noHover || reduce) return

    let raf = 0
    const move = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", e.clientX + "px")
        el.style.setProperty("--my", e.clientY + "px")
      })
    }
    window.addEventListener("mousemove", move, { passive: true })
    return () => {
      window.removeEventListener("mousemove", move)
      cancelAnimationFrame(raf)
    }
  }, [])

  const gridLines =
    "linear-gradient(var(--c) 1px, transparent 1px)," +
    "linear-gradient(90deg, var(--c) 1px, transparent 1px)"

  return (
    <div 
      ref={ref}
      aria-hidden 
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        "--mx": "-200px",
        "--my": "-200px",
        background: "var(--bg)"
      }}
    >
      {/* 1 · faint static grid (always visible) */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          ["--c"]: "#ffffff",
          backgroundImage: gridLines,
          backgroundSize: "44px 44px",
        }}
      />

      {/* 2 · accent grid, revealed only around the cursor */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          ["--c"]: "var(--accent)",
          backgroundImage: gridLines,
          backgroundSize: "44px 44px",
          WebkitMaskImage:
            "radial-gradient(240px circle at var(--mx) var(--my), #000 0%, transparent 65%)",
          maskImage:
            "radial-gradient(240px circle at var(--mx) var(--my), #000 0%, transparent 65%)",
        }}
      />

      {/* 3 · soft accent glow under the cursor (adds depth) */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          background:
            "radial-gradient(300px circle at var(--mx) var(--my), var(--accent), transparent 60%)",
        }}
      />

      {/* 4 · grain so black isn't flat */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  )
}
