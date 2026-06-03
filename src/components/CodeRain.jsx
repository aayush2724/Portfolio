import { useEffect, useRef } from "react"

export default function CodeRain({ opacity = 0.12 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let raf, w, h, cols, drops
    const chars = "01{}[]()<>/=;+*&|!ABCDEF#".split("")
    const font = 14

    const resize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      cols = Math.floor(w / font)
      drops = Array(cols).fill(1)
    }
    resize()
    window.addEventListener("resize", resize)

    let last = 0
    const draw = (t) => {
      raf = requestAnimationFrame(draw)
      if (t - last < 55) return // throttle ~18fps, keeps it cheap
      last = t
      ctx.fillStyle = "rgba(10,10,15,0.25)"
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = "#7c3aed"
      ctx.font = `${font}px monospace`
      drops.forEach((y, i) => {
        const ch = chars[(Math.random() * chars.length) | 0]
        ctx.fillText(ch, i * font, y * font)
        if (y * font > h && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full -z-10"
      style={{ opacity }}
    />
  )
}
