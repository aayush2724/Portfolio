import { useEffect, useRef } from "react"
import { useLowPower } from "../context/motion"

export default function InteractiveGrid() {
  const ref = useRef(null)
  const lowPower = useLowPower()

  useEffect(() => {
    const el = ref.current
    if (!el || lowPower) return

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
  }, [lowPower])

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

      {/* Layers 2-4 are cursor candy plus a feTurbulence grain under
          mix-blend-overlay. With no cursor to reveal them they are invisible on
          touch, but the browser still composites three extra full-screen layers
          on every scroll frame — so phones skip them entirely. */}
      {!lowPower && (
        <>
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
        </>
      )}
    </div>
  )
}
