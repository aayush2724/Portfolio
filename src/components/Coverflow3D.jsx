import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export default function Coverflow3D({ projects = [] }) {
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
              className="coverflow-card absolute h-[60%] w-[290px] md:w-[360px] cursor-pointer overflow-hidden rounded-3xl"
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
                if (isCenter) { if (p.link) window.open(p.link, "_blank") }
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
                {/* number watermark */}
                <span className="absolute right-4 top-2 font-display text-7xl md:text-8xl leading-none opacity-10">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                {/* content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(p.tags ?? []).slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl uppercase leading-none">{p.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)] line-clamp-2">{p.description}</p>
                  {isCenter && p.link && (
                    <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent-ink)]">
                      View project →
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
