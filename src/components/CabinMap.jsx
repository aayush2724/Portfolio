import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLowPower } from "../context/motion"
import { HOTSPOTS } from "../three/stations"

/**
 * The map moment.
 *
 * Desktop: the section is an empty screen — the page content steps aside and
 * the room behind it (CinemaStage in "walk" mode) shows every door with a
 * clickable marker.
 *
 * Phones, touch tablets and weak desktops: the section shows a still of the
 * room with an "enter" button; the room itself ("room" mode) is fetched only
 * on that tap, so three.js never costs a visitor who does not ask for it,
 * and it renders only while touched. A portrait frame only fits a slice of
 * the room, so a rail of door chips under it lists every page: the chip for
 * the door in view lights up as the visitor turns, and a tap on any chip
 * flies the camera to that door and opens the page. If WebGL is missing,
 * the import fails, or the visitor prefers reduced motion, the doors are a
 * plain list instead.
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

/**
 * The door rail: every page as a chip in one row that scrolls sideways.
 * `facing` is the door the camera is looking at; its chip is lit and kept in
 * view (horizontal scroll only, so the page never jumps). A tap hands the
 * door to the room when it is up, and falls back to the plain anchor jump
 * otherwise.
 */
function DoorRail({ facing, onGo }) {
  const rail = useRef(null)

  useEffect(() => {
    const el = rail.current
    const chip = facing && el?.querySelector(`[data-door="${facing}"]`)
    if (!el || !chip) return
    const left = chip.offsetLeft - (el.clientWidth - chip.offsetWidth) / 2
    el.scrollTo({ left: Math.max(0, left), behavior: "smooth" })
  }, [facing])

  return (
    <nav aria-label="Doors" className="-mx-6 mt-4 md:mx-0">
      <ul
        ref={rail}
        className="scrollbar-hide flex snap-x gap-2 overflow-x-auto px-6 pb-1 md:px-0"
        style={{ scrollPaddingInline: 24 }}
      >
        {HOTSPOTS.map((h) => {
          const lit = facing === h.id
          return (
            <li key={h.id} className="shrink-0 snap-start">
              <a
                href={`#${h.id}`}
                data-door={h.id}
                aria-current={lit ? "location" : undefined}
                onClick={(e) => {
                  if (onGo(h.id)) e.preventDefault()
                }}
                className="flex items-center gap-2.5 rounded-full border py-2 pl-2.5 pr-4 transition-colors duration-300"
                style={{
                  borderColor: lit ? "var(--accent)" : "var(--line)",
                  background: lit ? "rgb(var(--accent-rgb) / 0.08)" : "var(--surface)",
                }}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full transition-colors duration-300"
                  style={{
                    background: lit ? "var(--accent)" : "var(--muted)",
                    boxShadow: lit ? "0 0 10px 2px rgb(var(--accent-rgb) / 0.45)" : "none",
                  }}
                />
                <span className="flex flex-col leading-tight">
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300"
                    style={{ color: lit ? "var(--accent)" : "var(--fg)" }}
                  >
                    {h.label}
                  </span>
                  <span className="whitespace-nowrap text-[11px]" style={{ color: "var(--muted)" }}>
                    {h.hint}
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
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

/**
 * The still of the room shown before (and under) the live one. The box is
 * wider than tall once the viewport's aspect passes about 5:8 (its height
 * is capped at 56svh), and the wide still matches it from there.
 */
function Poster() {
  return (
    <picture>
      <source media="(min-aspect-ratio: 5/8)" srcSet="/hq-poster-wide.webp" />
      <img
        src="/hq-poster-tall.webp"
        alt=""
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  )
}

export default function CabinMap() {
  const lowPower = useLowPower()
  const api = useRef(null)
  const facingRef = useRef(null)
  const pressing = useRef(false)
  const [Stage, setStage] = useState(null)
  const [failed, setFailed] = useState(false)
  const [wanted, setWanted] = useState(false)
  const [facing, setFacing] = useState(null)
  const [touched, setTouched] = useState(false)
  const roomable = useMemo(() => lowPower && canHostRoom(), [lowPower])

  // Fetch the room only once asked for, so the page never pays for three.js
  // on a phone that just scrolls past.
  useEffect(() => {
    if (!wanted || !roomable || Stage || failed) return
    let alive = true
    import("./CinemaStage")
      .then((m) => alive && setStage(() => m.default))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [wanted, roomable, Stage, failed])

  // The door in view changed. While a finger is on the room (a swipe), a
  // tick marks the moment the next door comes round; silent otherwise.
  const onFacing = useCallback((id) => {
    const prev = facingRef.current
    facingRef.current = id
    if (id && prev && id !== prev && pressing.current) navigator.vibrate?.(8)
    setFacing(id)
  }, [])

  // A chip tap goes through the room when it is up (the camera flies to the
  // door, then the page lands there); before that it is a plain anchor.
  const go = useCallback((id) => {
    if (!api.current) return false
    api.current.go(id)
    return true
  }, [])

  if (lowPower) {
    const list = !roomable || failed
    return (
      <section id="hq" className="relative py-16 md:px-16" aria-label="HQ: a 3D map of every page">
        <div className="mx-auto max-w-4xl px-6 md:px-0">
          <div className="mb-6 flex flex-col gap-2">
            <Caption>
              {list
                ? "Every page lives somewhere in here."
                : "Every page lives somewhere in here. Step in and drag to look around, tap a light to go through, or pick a door below."}
            </Caption>
          </div>
          {list ? (
            <DoorList />
          ) : (
            <>
              <div
                className="hq-room relative w-full overflow-hidden rounded-3xl border"
                style={{ height: "clamp(300px, 56svh, 520px)", borderColor: "var(--line)", background: "var(--bg)" }}
                onPointerDownCapture={() => {
                  pressing.current = true
                  setTouched(true)
                }}
                onPointerUpCapture={() => (pressing.current = false)}
                onPointerCancelCapture={() => (pressing.current = false)}
                onPointerLeave={() => (pressing.current = false)}
              >
                <Poster />
                {Stage && <Stage mode="room" ref={api} onFacing={onFacing} />}
                {/* The way in: the live room replaces this once it has loaded */}
                {!Stage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setWanted(true)}
                      disabled={wanted}
                      aria-busy={wanted}
                      className="rounded-full px-6 py-3 font-display text-sm font-semibold shadow-2xl transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0"
                      style={{
                        background: "var(--accent)",
                        color: "var(--accent-ink)",
                        boxShadow: "0 0 24px rgb(var(--accent-rgb) / 0.25)",
                      }}
                    >
                      {wanted ? "Opening the room…" : "Enter the room"}
                    </button>
                    <span
                      className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                      style={{
                        borderColor: "var(--line)",
                        background: "rgb(var(--bg-rgb) / 0.72)",
                        color: "var(--muted)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      3D · loads on tap
                    </span>
                  </div>
                )}
                {/* How to look around, until the first touch says they know */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center transition-opacity duration-500"
                  style={{ opacity: Stage && !touched ? 1 : 0 }}
                >
                  <span
                    className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      borderColor: "var(--line)",
                      background: "rgb(var(--bg-rgb) / 0.72)",
                      color: "var(--muted)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    ◂ drag to look around ▸
                  </span>
                </div>
              </div>
              <DoorRail facing={facing} onGo={go} />
            </>
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
