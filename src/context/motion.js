import { useEffect, useState } from "react"
import Lenis from "lenis"

/**
 * True when the device is a touch/phone-class device.
 * Evaluated synchronously on first render so heavy effects are never mounted
 * and then torn down (mounting them for one frame is what caused the jank).
 */
const coarsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches

const smallScreen = () =>
  typeof window !== "undefined" && window.innerWidth < 768

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Weak hardware: <=4 logical cores or <=4GB RAM. Both hints are advisory and
 * missing on Safari, so they only ever add devices to the low-power set.
 */
const weakHardware = () => {
  if (typeof navigator === "undefined") return false
  const cores = navigator.hardwareConcurrency
  const mem = navigator.deviceMemory
  return (cores > 0 && cores <= 4) || (mem > 0 && mem <= 4)
}

/**
 * Single switch for "strip the expensive candy".
 * Gates scroll-linked transforms, infinite loops, blurs and blend modes that
 * a phone GPU cannot composite at 60fps.
 */
export function useLowPower() {
  const [low, setLow] = useState(
    () => coarsePointer() || smallScreen() || reducedMotion() || weakHardware()
  )

  useEffect(() => {
    const mqs = [
      window.matchMedia("(pointer: coarse)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(max-width: 767px)"),
    ]
    const update = () =>
      setLow(coarsePointer() || smallScreen() || reducedMotion() || weakHardware())

    mqs.forEach((mq) => mq.addEventListener("change", update))
    return () => mqs.forEach((mq) => mq.removeEventListener("change", update))
  }, [])

  return low
}

/**
 * Global smooth/inertia scrolling. Call once near the root (e.g. in App).
 *
 * Touch devices are skipped entirely: mobile browsers already scroll on the
 * compositor thread, so layering Lenis on top adds a permanent rAF loop and
 * moves scrolling back onto the main thread — the single biggest source of
 * mobile scroll lag.
 */
export function useLenis() {
  useEffect(() => {
    if (coarsePointer() || reducedMotion()) return

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
      // Route #anchor clicks through Lenis so in-page nav glides instead of
      // the native jump fighting the rAF loop mid-flight.
      anchors: true,
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
  const [reduced, setReduced] = useState(reducedMotion)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return reduced
}
