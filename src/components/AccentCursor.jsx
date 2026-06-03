import { useEffect, useRef, useState } from "react"

export default function AccentCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [isTouch, setIsTouch] = useState(false)
  
  const mouse = useRef({ x: 0, y: 0 })
  const ring = useRef({ x: 0, y: 0 })
  const isHovering = useRef(false)

  useEffect(() => {
    // Detect touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true)
      return
    }

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseOver = (e) => {
      const interactive = e.target.closest('a, button, [role="button"], .coverflow-card')
      isHovering.current = !!interactive
    }

    const animate = () => {
      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px)`
      }

      // Ring lags with lerp
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15

      if (ringRef.current) {
        const size = isHovering.current ? 48 : 32
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) scale(${size / 32})`
      }

      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onMouseOver)
    const raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(raf)
    }
  }, [])

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
        <div className="w-full h-full rounded-full bg-[var(--accent)]" />
      </div>

      {/* Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[10000] transition-transform duration-300 ease-out"
        style={{
          width: '32px',
          height: '32px',
          marginLeft: '-16px',
          marginTop: '-16px',
        }}
      >
        <div 
          className="w-full h-full rounded-full border-2"
          style={{
            borderColor: 'var(--accent)',
            opacity: 0.2,
          }}
        />
      </div>
    </>
  )
}
