import { useEffect, useRef, useState } from "react"

export default function AccentCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const textRef = useRef(null)
  // Resolved on first render so the cursor layers are never mounted on a phone.
  const [isTouch] = useState(
    () =>
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  )
  const [text, setText] = useState("")
  const textRefValue = useRef("")
  
  const mouse = useRef({ x: 0, y: 0 })
  const ring = useRef({ x: 0, y: 0 })
  const isHovering = useRef(false)
  const overText = useRef(false)
  // Inside #projects the overlay hides entirely — the cards are busy enough
  // that the ring reads as clutter, so that section gets the native cursor.
  const suppressed = useRef(false)

  // Mirror `text` into a ref so the rAF loop can read it without being torn
  // down and restarted on every change.
  useEffect(() => {
    textRefValue.current = text
  }, [text])

  useEffect(() => {
    if (isTouch) return

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseOver = (e) => {
      suppressed.current = !!e.target.closest('#projects')
      const interactive = e.target.closest('a, button, [role="button"], .coverflow-card')
      isHovering.current = !!interactive
      // Over prose the ring shrinks toward the dot so it never obscures reading
      overText.current = !interactive &&
        !!e.target.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote')

      const textTarget = e.target.closest('[data-cursor]')
      if (textTarget) {
        setText(textTarget.getAttribute('data-cursor'))
      } else {
        setText("")
      }
    }

    // Track the live frame id: the loop reschedules itself, so cancelling only
    // the first id leaked a permanent rAF loop on every text change.
    let rafId = 0
    const animate = () => {
      const hide = suppressed.current
      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px)`
        dotRef.current.style.opacity = hide ? "0" : "1"
      }

      // Ring lags with lerp
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15

      if (ringRef.current) {
        const label = textRefValue.current
        const size = isHovering.current || label ? 64 : overText.current ? 14 : 32
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) scale(${size / 32})`
        ringRef.current.style.opacity = hide ? "0" : "1"
      }

      if (textRef.current) {
        textRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`
        textRef.current.style.opacity = hide ? "0" : (text ? "1" : "0")
      }

      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onMouseOver, { passive: true })
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(rafId)
    }
  }, [isTouch])

  if (isTouch) return null

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[10000] mix-blend-difference"
        style={{
          width: '8px',
          height: '8px',
          marginLeft: '-4px',
          marginTop: '-4px',
        }}
      >
        <div className={`w-full h-full rounded-full bg-[var(--accent)] transition-opacity duration-200 ${text ? 'opacity-0' : 'opacity-100'}`} />
      </div>

      {/* Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] transition-transform duration-300 ease-out flex items-center justify-center"
        style={{
          width: '32px',
          height: '32px',
          marginLeft: '-16px',
          marginTop: '-16px',
        }}
      >
        <div 
          className={`w-full h-full rounded-full transition-all duration-300 ${text ? 'bg-[var(--accent)] border-none' : 'border-2 bg-transparent'}`}
          style={{
            borderColor: text ? 'transparent' : 'var(--accent)',
            opacity: text ? 0.9 : 0.2,
          }}
        />
      </div>

      {/* Text */}
      <div
        ref={textRef}
        className="pointer-events-none fixed top-0 left-0 z-[10000] flex items-center justify-center transition-opacity duration-300"
        style={{
          width: '64px',
          height: '64px',
          marginLeft: '-32px',
          marginTop: '-32px',
          opacity: text ? 1 : 0,
        }}
      >
        <span className="text-[9px] font-bold text-[var(--bg)] tracking-wider uppercase text-center leading-tight px-1">
          {text}
        </span>
      </div>
    </>
  )
}
