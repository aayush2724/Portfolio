import { useEffect, useMemo, useRef, useState } from "react"
import { useLowPower } from "../context/motion"
import { HOTSPOTS } from "../three/stations"

/**
 * The map moment.
 *
 * Desktop: the section is an empty screen — the page content steps aside and
 * the room behind it (CinemaStage in "walk" mode) shows every door with a
 * clickable marker.
 *
 * Phones, touch tablets and weak desktops: the section hosts the same room
 * in "room" mode, loaded only once the section comes near the viewport and
 * rendered only while touched. If WebGL is missing, the import fails, or the
 * visitor prefers reduced motion, the doors are a plain list instead.
 */
const canHostRoom = () =>
  typeof window !== "undefined" &&
  typeof WebGL2RenderingContext !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches

function DoorList() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {HOTSPOTS.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className="flex flex-col gap-1 rounded-2xl border px-4 py-3 transition-colors hover:border-accent"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            <span className="font-display text-base">{h.label}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              {h.hint}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function Caption({ children }) {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: "var(--accent)" }}>
        Aayush HQ
      </p>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {children}
      </p>
    </>
  )
}

export default function CabinMap() {
  const lowPower = useLowPower()
  const host = useRef(null)
  const [Stage, setStage] = useState(null)
  const [failed, setFailed] = useState(false)
  const roomable = useMemo(() => lowPower && canHostRoom(), [lowPower])

  // Load the room only as the section approaches, so the hero and the first
  // scroll never pay for three.js.
  useEffect(() => {
    if (!roomable || Stage || failed) return
    const el = host.current
    if (!el) return
    let alive = true
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        import("./CinemaStage")
          .then((m) => alive && setStage(() => m.default))
          .catch(() => alive && setFailed(true))
      },
      { rootMargin: "120% 0px" }
    )
    io.observe(el)
    return () => {
      alive = false
      io.disconnect()
    }
  }, [roomable, Stage, failed])

  if (lowPower) {
    const list = !roomable || failed
    return (
      <section id="hq" ref={host} className="relative py-16 md:px-16" aria-label="HQ: a 3D map of every page">
        <div className="mx-auto max-w-4xl px-6 md:px-0">
          <div className="mb-6 flex flex-col gap-2">
            <Caption>
              {list
                ? "Every page lives somewhere in here."
                : "Every page lives somewhere in here. Drag sideways to look around; tap an object or its light to open it."}
            </Caption>
          </div>
          {list ? (
            <DoorList />
          ) : (
            <div
              className="hq-room relative w-full overflow-hidden rounded-3xl border"
              style={{ height: "min(78svh, 720px)", borderColor: "var(--line)", background: "var(--bg)" }}
            >
              {Stage ? (
                <Stage mode="room" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--muted)" }}>
                    Loading the room
                  </span>
                </div>
              )}
            </div>
          )}
          {/* Keyboard and screen-reader route to the same doors */}
          {!list && (
            <ul className="sr-only">
              {HOTSPOTS.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>
                    {h.label} — {h.hint}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    )
  }

  return (
    <section id="hq" className="relative h-screen" aria-label="HQ: a 3D map of every page">
      <div className="pointer-events-none absolute inset-x-0 top-28 flex flex-col items-center gap-2 px-6 text-center">
        <Caption>Every page lives somewhere in here. Drag to look around; click an object or its light to open it.</Caption>
      </div>
      {/* Keyboard and screen-reader route to the same doors */}
      <ul className="sr-only">
        {HOTSPOTS.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`}>
              {h.label} — {h.hint}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
