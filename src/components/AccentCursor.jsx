import { useEffect, useRef, useState } from "react"

/**
 * Desktop cursor, inverting-blob technique.
 *
 * - A small lime dot is the precise pointer; it stretches along its velocity.
 * - Over a link or button a white disc grows under the pointer with
 *   `mix-blend-mode: difference`, so whatever sits beneath it inverts — text
 *   flips dark, pills flip — instead of anything being outlined.
 * - `[data-cursor="Label"]` targets (and a `cursor-label` window event, which
 *   the 3D room uses) show a lime disc carrying a word instead.
 * - The native pointer is hidden by index.css only once this stamps
 *   `html.cursor-custom`, so a script failure never leaves the visitor without
 *   a cursor. Form fields keep the native I-beam and the overlay fades out.
 * - Two fixed nodes, one rAF loop, transform-only.
 */
const BLOB = 52
const LABEL = 64

const lerp = (a, b, t) => a + (b - a) * t

export default function AccentCursor() {
  const dotRef = useRef(null)
  const blobRef = useRef(null)
  const textRef = useRef(null)
  // Resolved on first render so the cursor layers are never mounted on a phone
  // or for visitors who asked for reduced motion.
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      !("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
  const [text, setText] = useState("")
  // Mirror `text` into a ref so the rAF loop can read it without being torn
  // down and restarted on every change.
  const label = useRef("")
  useEffect(() => {
    label.current = text
  }, [text])

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.classList.add("cursor-custom")

    const mouse = { x: -100, y: -100 }
    const vel = { x: 0, y: 0 }
    const blob = { x: -100, y: -100, size: 0 }
    const st = { seen: false, inside: true, pressed: false, native: false, hover: false, external: "" }

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      st.seen = true
      st.inside = true
    }
    const onOver = (e) => {
      const t = e.target
      st.native = !!t.closest('input, textarea, select, [contenteditable="true"], iframe')
      const labelEl = t.closest("[data-cursor]")
      st.hover = !labelEl && !!t.closest('a, button, [role="button"], .coverflow-card')
      const next = labelEl ? labelEl.getAttribute("data-cursor") || "" : st.external
      setText(next)
    }
    // The 3D room (and anything else without DOM targets) can ask for a word.
    const onExternal = (e) => {
      st.external = (e.detail && String(e.detail)) || ""
      setText(st.external)
    }
    const onDown = () => { st.pressed = true }
    const onUp = () => { st.pressed = false }
    const onLeave = () => { st.inside = false }
    const onEnter = () => { st.inside = true }

    // Track the live frame id: the loop reschedules itself, so cancelling only
    // the first id would leak a permanent rAF loop.
    let raf = 0
    let prevX = mouse.x
    let prevY = mouse.y
    const frame = () => {
      vel.x = lerp(vel.x, mouse.x - prevX, 0.35)
      vel.y = lerp(vel.y, mouse.y - prevY, 0.35)
      prevX = mouse.x
      prevY = mouse.y
      const speed = Math.hypot(vel.x, vel.y)
      const stretch = 1 + Math.min(speed / 28, 1.4)
      const angle = Math.atan2(vel.y, vel.x)

      const visible = st.seen && st.inside && !st.native
      const press = st.pressed ? 0.82 : 1
      const hasLabel = !!label.current
      const target = hasLabel ? LABEL : st.hover ? BLOB : 0

      blob.x = lerp(blob.x, mouse.x, 0.2)
      blob.y = lerp(blob.y, mouse.y, 0.2)
      blob.size = lerp(blob.size, target, 0.18)

      const dot = dotRef.current
      if (dot) {
        dot.style.transform =
          `translate(${mouse.x}px, ${mouse.y}px) rotate(${angle}rad) ` +
          `scale(${stretch * press}, ${press / Math.sqrt(stretch)})`
        dot.style.opacity = visible && !hasLabel ? "1" : "0"
      }
      const el = blobRef.current
      if (el) {
        const s = Math.max(0, blob.size) * press
        el.style.transform = `translate(${blob.x - s / 2}px, ${blob.y - s / 2}px)`
        el.style.width = `${s}px`
        el.style.height = `${s}px`
        el.style.opacity = visible && s > 1 ? "1" : "0"
      }
      const tEl = textRef.current
      if (tEl) {
        tEl.style.transform = `translate(${blob.x}px, ${blob.y}px) scale(${press})`
        tEl.style.opacity = visible && hasLabel ? "1" : "0"
      }
      raf = requestAnimationFrame(frame)
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseover", onOver, { passive: true })
    window.addEventListener("mousedown", onDown, { passive: true })
    window.addEventListener("mouseup", onUp, { passive: true })
    window.addEventListener("cursor-label", onExternal)
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)
    raf = requestAnimationFrame(frame)

    return () => {
      root.classList.remove("cursor-custom")
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseover", onOver)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("cursor-label", onExternal)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      {/* Dot — the precise pointer; rotates and stretches with velocity */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[10000] mix-blend-difference rounded-full bg-[var(--accent)] transition-opacity duration-150"
        style={{ width: "8px", height: "8px", marginLeft: "-4px", marginTop: "-4px", opacity: 0 }}
      />

      {/* Blob — grows under the pointer over interactive targets and inverts
          what is beneath it; carries a lime fill while a label is showing */}
      <div
        ref={blobRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-[9999] rounded-full transition-[opacity,background-color] duration-200 ${
          text ? "bg-[var(--accent)]" : "bg-white mix-blend-difference"
        }`}
        style={{ width: 0, height: 0, opacity: 0 }}
      />

      {/* Label — rides on the blob when a [data-cursor] target is hovered */}
      <div
        ref={textRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[10000] flex items-center justify-center transition-opacity duration-200"
        style={{ width: `${LABEL}px`, height: `${LABEL}px`, marginLeft: `${-LABEL / 2}px`, marginTop: `${-LABEL / 2}px`, opacity: 0 }}
      >
        <span className="text-[9px] font-bold text-[var(--accent-ink)] tracking-wider uppercase text-center leading-tight px-1">
          {text}
        </span>
      </div>
    </>
  )
}
