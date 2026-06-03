import { useEffect, useState } from "react"
import Lenis from "lenis"

/**
 * Global smooth/inertia scrolling. Call once near the root (e.g. in App).
 * Stores the Lenis instance on window.__lenis so the 3D scene can read progress.
 */
export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })

    window.__lenis = lenis

    let rafId
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}

/** Returns true if the user prefers reduced motion. Use to disable heavy effects. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return reduced
}