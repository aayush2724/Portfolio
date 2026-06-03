import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export default function Coverflow3D({ projects = [], onProjectClick }) {
  const [index, setIndex] = useState(0)
  const containerRef = useRef(null)
  const n = projects.length
  const clamp = (i) => Math.max(0, Math.min(n - 1, i))
  const go = (dir) => setIndex((i) => clamp(i + dir))

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [n])

  // wheel (throttled) - with proper preventDefault
  const wheelLock = useRef(false)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onWheel = (e) => {
      if (wheelLock.current) return
      const d = e.deltaX || e.deltaY
      if (Math.abs(d) < 8) return
      
      // Prevent page scroll
      e.preventDefault()
      
      wheelLock.current = true
      go(d > 0 ? 1 : -1)
      setTimeout(() => (wheelLock.current = false), 320)
    }

    // Add listener with passive: false to allow preventDefault
    container.addEventListener("wheel", onWheel, { passive: false })
    return () => container.removeEventListener("wheel", onWheel)
  }, [n])

  // pointer drag
  const drag = useRef({ active: false, startX: 0, moved: false })
  const onPointerDown = (e) => (drag.current = { active: true, startX: e.clientX, moved: false })
  const onPointerMove = (e) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 55) {
      go(dx > 0 ? -1 : 1)
      drag.current.active = false
      drag.current.moved = true
    }
  }
  const endDrag = () => (drag.current.active = false)

  return (
    <div
      ref={containerRef}
      className="relative h-[68vh] w-full select-none [perspective:2200px]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
        {projects.map((p, i) => {
          const offset = i - index
          const abs = Math.abs(offset)
          const isCenter = offset === 0
          return (
            <motion.article
              key={p.id ?? i}
              className="coverflow-card absolute h-[65%] w-[290px] md:w-[380px] cursor-pointer overflow-hidden rounded-3xl"
              style={{ transformStyle: "preserve-3d", zIndex: 100 - abs }}
              animate={{
                x: offset * 230,
                z: -abs * 210,
                rotateY: offset * -33,
                scale: 1 - abs * 0.11,
                opacity: abs <= 3 ? 1 - abs * 0.16 : 0,
                filter: `brightness(${Math.max(0.45, 1 - abs * 0.22)})`,
                boxShadow: isCenter
                  ? "0 40px 90px -25px var(--accent)"
                  : "0 25px 60px -35px #000",
              }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
              whileHover={isCenter ? { y: -10 } : {}}
              onClick={() => {
                if (drag.current.moved) { drag.current.moved = false; return }
                if (isCenter) {
                  // If onProjectClick callback exists, use it (for case study modal)
                  if (onProjectClick) {
                    onProjectClick(p.title)
                  } else if (p.link) {
                    // Otherwise fall back to opening link
                    window.open(p.link, "_blank")
                  }
                }
                else setIndex(i)
              }}
            >
              <div
                className="relative h-full w-full border"
                style={{ borderColor: isCenter ? "var(--accent)" : "var(--line)" }}
              >
                {/* media */}
                {p.image ? (
                  <img src={p.image} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(150deg, #15151a, #0a0a0b)" }} />
                )}
                {/* number watermark - smaller and more subtle */}
                <span className="absolute right-3 top-3 font-display text-6xl leading-none opacity-[0.06]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* gradient scrim - stronger for better readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                {/* content - more spacious layout */}
                <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-8">
                  {/* Tags - only show 2 most important */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {(p.tags ?? []).slice(0, 2).map((t) => (
                      <span 
                        key={t} 
                        className="rounded-full border border-white/20 bg-black/30 backdrop-blur-sm px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white/80"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  
                  {/* Title - more spacing */}
                  <h3 className="font-display text-2xl md:text-3xl uppercase leading-tight text-white mb-3">
                    {p.title}
                  </h3>
                  
                  {/* Description - better line height and spacing */}
                  <p className="text-sm leading-relaxed text-white/70 line-clamp-2 mb-5">
                    {p.description}
                  </p>
                  
                  {/* CTA button - only show on center card */}
                  {isCenter && (
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--accent-ink)] shadow-lg">
                      {onProjectClick ? "View case study →" : "View project →"}
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>

      {/* controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-6">
        <button onClick={() => go(-1)} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] text-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition">←</button>
        <span className="font-display text-sm tracking-widest text-[var(--muted)]">
          <span className="text-[var(--fg)]">{String(index + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
        </span>
        <button onClick={() => go(1)} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] text-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition">→</button>
      </div>
    </div>
  )
}
