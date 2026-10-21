import { useEffect, useState } from "react"

/**
 * "A full-screen overlay is covering the page."
 *
 * The walk-mode room renders every frame behind the whole page. Under a modal
 * nobody can see it, but it still costs a WebGL frame plus a re-composite of
 * everything above it on each tick — enough to make opening and scrolling the
 * modal stutter. Overlays mark themselves open here and the stage pauses until
 * the count drops back to zero.
 */
let open = 0
const EVENT = "overlay-change"

/** Call from an overlay with its open state; counted, so overlays can stack. */
export function useOverlay(isOpen) {
  useEffect(() => {
    if (!isOpen) return
    open++
    window.dispatchEvent(new Event(EVENT))
    return () => {
      open--
      window.dispatchEvent(new Event(EVENT))
    }
  }, [isOpen])
}

/** True while any overlay is open. */
export function useOverlayOpen() {
  const [covered, setCovered] = useState(() => open > 0)
  useEffect(() => {
    const update = () => setCovered(open > 0)
    update()
    window.addEventListener(EVENT, update)
    return () => window.removeEventListener(EVENT, update)
  }, [])
  return covered
}
