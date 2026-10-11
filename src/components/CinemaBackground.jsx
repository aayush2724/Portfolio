import { useEffect, useState } from "react"
import { useLowPower } from "../context/motion"

/**
 * Desktop-only 3D stage behind the page.
 *
 * The scene is a separate chunk behind a dynamic import: three.js and
 * @react-three/fiber are ~1MB of JS, and statically importing them would put
 * that cost on every phone that loads the site even though the canvas never
 * renders there. The import only fires once the media query passes.
 *
 * Deliberately not React.lazy: a lazy component resolves on a low-priority
 * "retry" lane, and the hero's per-frame state updates (typewriter, counters)
 * kept interrupting that render for 2–3 seconds before the stage could
 * commit. A plain state update renders with everything else.
 */
export default function CinemaBackground() {
  const [enabled, setEnabled] = useState(false)
  const [Stage, setStage] = useState(null)
  // Same switch CabinMap uses, so a weak desktop gets the list map and no
  // canvas rather than the canvas with the list.
  const lowPower = useLowPower()

  // Skip the WebGL canvas entirely on touch, small screens, weak hardware and
  // reduced motion — InteractiveGrid still paints the background there.
  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    )
    const update = () => setEnabled(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!enabled || lowPower || Stage) return
    let alive = true
    import("./CinemaStage").then((m) => {
      if (alive) setStage(() => m.default)
    })
    return () => {
      alive = false
    }
  }, [enabled, lowPower, Stage])

  if (!enabled || lowPower || !Stage) return null
  return <Stage />
}
