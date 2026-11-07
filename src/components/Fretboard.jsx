import { useCallback, useEffect, useRef, useState } from "react"
import Reveal from "./Reveal"
import CommandLabel from "./CommandLabel"
import AnimatedHeading from "./AnimatedHeading"
import { useLowPower } from "../context/motion"
import { createPlucker } from "../lib/pluck"
import { createRiffRenderer } from "../lib/riffCanvas"
import {
  DEFAULT_SPEED,
  JAM_CHORDS,
  RIFFS,
  SPEEDS,
  SPEED_LABELS,
  STRINGS,
  abandon,
  accuracy,
  bpmForLoop,
  createGame,
  pause,
  pluckOnly,
  press,
  readBest,
  readSound,
  readSpeed,
  resume,
  applySpeed,
  start,
  step,
  writeBest,
  writeSound,
  writeSpeed,
} from "../lib/riff"

/**
 * Pluck It — the riff game (main) plus a jam mode that turns the four
 * strings into a pocket guitar tuned to a chord (secondary).
 *
 * Riff: notes slide toward a fret line; pluck the right string as each one
 * crosses it. Three original riffs, a speed bar that sets both the tempo and
 * how long notes take to reach the fret, and a signal bar that misses drain.
 * The engine, renderer and synth live in src/lib. Space only acts while the
 * board is hovered or focused, so it never hijacks scrolling elsewhere.
 */

// Strings by physical key (QWERTY positions) and by typed letter, so other
// layouts work too. G doubles for J for people who keep one hand on the left.
const KEY_CODES = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3 }
const KEY_LETTERS = { d: 0, f: 1, j: 2, g: 2, k: 3 }
const stringForKey = (e) => {
  if (e.code in KEY_CODES) return KEY_CODES[e.code]
  const letter = (e.key || "").toLowerCase()
  return letter in KEY_LETTERS ? KEY_LETTERS[letter] : -1
}
const CHORD_KEYS = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6"]
const CARD_STYLE = { borderColor: "var(--line)", background: "rgba(255,255,255,0.02)" }
const fmt = (n) => String(Math.min(99999, n)).padStart(4, "0")

const storage = (() => {
  try {
    return window.localStorage
  } catch {
    return null
  }
})()

function Pill({ active, onClick, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--fg)]"
      }`}
    >
      {children}
    </button>
  )
}

export default function Fretboard() {
  const lowPower = useLowPower()
  const canvasRef = useRef(null)
  const boardRef = useRef(null)
  const rendererRef = useRef(null)
  const gameRef = useRef(null)
  if (!gameRef.current) {
    gameRef.current = createGame()
    // Dev-only handle for scripted play-testing; stripped from production builds.
    if (import.meta.env.DEV) window.__fretGame = gameRef.current
  }
  const pluckerRef = useRef(null)
  const rafRef = useRef(0)
  const animUntil = useRef(0)
  const hovered = useRef(false)
  const inView = useRef(false)
  const touch = useRef(false)

  const [mode, setMode] = useState("riff") // riff (main) | jam
  const [chordIdx, setChordIdx] = useState(0)
  const [riffIdx, setRiffIdx] = useState(0)
  const [speed, setSpeed] = useState(() => (storage ? readSpeed(storage) : DEFAULT_SPEED))
  const [sound, setSound] = useState(() => (storage ? readSound(storage) : true))
  const [hud, setHud] = useState({ status: "idle", score: 0, combo: 0, health: 1, loop: 0 })
  const [best, setBest] = useState(() => (storage ? readBest(storage, RIFFS[0].id) : 0))
  const [summary, setSummary] = useState(null) // game-over stats
  const [announce, setAnnounce] = useState("")

  // Latest values for the animation frame, which never re-subscribes.
  const view = useRef({ mode, chordIdx })
  useEffect(() => {
    view.current = { mode, chordIdx }
  }, [mode, chordIdx])

  // The speed bar applies at once, even mid-run.
  useEffect(() => {
    applySpeed(gameRef.current, SPEEDS[speed], performance.now())
  }, [speed])

  const riff = RIFFS[riffIdx]
  const bpmAt = (r) => Math.round(r.bpm * SPEEDS[speed].tempo)
  const chord = JAM_CHORDS[chordIdx]

  /* ── renderer + resize ──────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    touch.current = matchMedia("(pointer: coarse)").matches
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
    const r = createRiffRenderer(canvas, { touch: touch.current, reduced, shimmer: !lowPower })
    rendererRef.current = r
    if (!r) return
    const paint = () => {
      r.resize()
      const v = view.current
      r.draw(gameRef.current, performance.now(), { jam: v.mode === "jam", label: v.mode === "jam" ? JAM_CHORDS[v.chordIdx].name : "" })
    }
    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(canvas.parentElement)
    document.fonts?.ready.then(paint)
    return () => ro.disconnect()
  }, [lowPower])

  /* ── frame loop: runs while a riff plays or something is still vibrating ─ */
  const syncHud = useCallback(() => {
    const g = gameRef.current
    setHud((h) =>
      h.status === g.status && h.score === g.score && h.combo === g.combo && h.loop === g.loop && Math.round(h.health * 100) === Math.round(g.health * 100)
        ? h
        : { status: g.status, score: g.score, combo: g.combo, health: g.health, loop: g.loop }
    )
  }, [])

  const finish = useCallback(() => {
    const g = gameRef.current
    const id = g.riff.id
    setBest((b) => {
      if (g.score <= b) return b
      if (storage) writeBest(storage, id, g.score)
      return g.score
    })
    setSummary({ score: g.score, acc: accuracy(g), combo: g.bestCombo, loops: g.loopsCleared })
    setAnnounce(`Signal lost. Score ${g.score}, ${accuracy(g)} percent hit.`)
  }, [])

  const frame = useCallback(
    (now) => {
      const g = gameRef.current
      const r = rendererRef.current
      if (!r) return
      if (g.status === "running") {
        const events = step(g, now)
        if (events.includes("loop")) setAnnounce(`Riff complete. Tempo up to ${Math.round(bpmForLoop(g.riff, g.loop, g.tempo))} bpm.`)
        if (events.includes("over")) finish()
      }
      const v = view.current
      r.draw(g, now, { jam: v.mode === "jam", label: v.mode === "jam" ? JAM_CHORDS[v.chordIdx].name : "" })
      syncHud()
      const keep = g.status === "running" || now < animUntil.current
      rafRef.current = keep ? requestAnimationFrame(frame) : 0
    },
    [finish, syncHud]
  )

  const kick = useCallback(
    (ms = 450) => {
      animUntil.current = Math.max(animUntil.current, performance.now() + ms)
      if (!rafRef.current) rafRef.current = requestAnimationFrame(frame)
    },
    [frame]
  )

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  // The letter keys work whenever the board is on screen; hover or focus is
  // not required. Space stays gated (below) so it never steals page scrolling.
  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const io = new IntersectionObserver(([entry]) => (inView.current = entry.isIntersecting), { threshold: 0.5 })
    io.observe(board)
    return () => io.disconnect()
  }, [])

  /* ── actions ────────────────────────────────────────────────────────── */
  const plucker = () => (pluckerRef.current ||= createPlucker())

  const beginRiff = useCallback(() => {
    plucker().warm()
    start(gameRef.current, performance.now(), RIFFS[riffIdx])
    setSummary(null)
    setAnnounce(`${RIFFS[riffIdx].name} started.`)
    kick()
  }, [riffIdx, kick])

  const doPause = useCallback(() => {
    if (pause(gameRef.current, performance.now())) syncHud()
  }, [syncHud])

  const doResume = useCallback(() => {
    if (resume(gameRef.current, performance.now())) kick()
  }, [kick])

  const pluckString = useCallback(
    (s) => {
      const g = gameRef.current
      const now = performance.now()
      if (mode === "jam") {
        pluckOnly(g, s, now)
        if (sound) plucker().pluck(chord.strings[s])
        kick()
        return
      }
      if (g.status === "paused") return doResume()
      if (g.status !== "running") return beginRiff()
      const kind = press(g, s, now)
      // A pluck with no note nearby still sounds, muted — a fretted ghost note.
      if (sound) plucker().pluck(kind ? g.lastJudgement.f : chord.strings[s], kind ? 0.5 : 0.12)
      kick()
    },
    [mode, sound, chord, kick, doResume, beginRiff]
  )

  const strum = useCallback(() => {
    for (let s = STRINGS - 1; s >= 0; s--) setTimeout(() => pluckString(s), (STRINGS - 1 - s) * 35)
  }, [pluckString])

  const switchMode = (next) => {
    if (next === mode) return
    const g = gameRef.current
    if (g.status === "running" || g.status === "paused") abandon(g)
    setSummary(null)
    setMode(next)
    kick(50)
  }

  const switchRiff = (i) => {
    const g = gameRef.current
    const wasLive = g.status === "running" || g.status === "paused"
    setRiffIdx(i)
    setBest(storage ? readBest(storage, RIFFS[i].id) : 0)
    setSummary(null)
    if (wasLive) {
      plucker().warm()
      start(g, performance.now(), RIFFS[i])
      kick()
    } else {
      abandon(g)
      kick(50)
    }
  }

  const changeSpeed = (i) => {
    setSpeed(i)
    if (storage) writeSpeed(storage, i)
    kick(50)
  }

  const toggleSound = () => {
    const next = !sound
    setSound(next)
    if (storage) writeSound(storage, next)
    if (next) plucker().warm()
  }

  /* ── input ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t?.isContentEditable) return
      const board = boardRef.current
      const focused = board && board.contains(document.activeElement)
      const engaged = focused || hovered.current
      if (!engaged && !inView.current) return
      const s = stringForKey(e)
      if (s >= 0) {
        e.preventDefault()
        pluckString(s)
      } else if (e.code === "Space") {
        // Space starts only when the board is hovered or focused; while a run
        // is live it pauses and resumes from anywhere on screen.
        const live = gameRef.current.status === "running" || gameRef.current.status === "paused"
        if (t instanceof HTMLButtonElement || (!engaged && !live)) return
        e.preventDefault()
        if (mode === "jam") return strum()
        const g = gameRef.current
        if (g.status === "running") doPause()
        else if (g.status === "paused") doResume()
        else beginRiff()
      } else if (mode === "jam" && engaged && CHORD_KEYS.includes(e.code)) {
        e.preventDefault()
        setChordIdx(CHORD_KEYS.indexOf(e.code))
        kick(50)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mode, pluckString, strum, doPause, doResume, beginRiff, kick])

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) doPause()
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [doPause])

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    boardRef.current?.focus({ preventScroll: true })
    const r = rendererRef.current
    if (r) pluckString(r.stringAt(e.clientY))
  }

  const isTouch = touch.current
  const status = hud.status
  const hint =
    mode === "jam"
      ? isTouch
        ? "Tap a string to pluck it. Pick a chord above."
        : "D F J K pluck the strings (G works for J) · space strums · 1–6 change the chord"
      : isTouch
        ? "Tap a string as its note reaches the fret. Tap the board to start."
        : "D F J K as the notes reach the fret (G works for J) · space starts and pauses"

  return (
    <section id="play" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl 2xl:max-w-[88vw]">
        <Reveal>
          <CommandLabel className="mb-6">npx pluck-it</CommandLabel>
        </Reveal>

        <Reveal>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
                Mini game
              </p>
              <AnimatedHeading text="Pluck It" decode as="h2" className="font-display text-5xl md:text-7xl uppercase leading-none" />
            </div>
            <p className="max-w-xl text-sm md:text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              Four strings and a plucked-string synth. Take on one of my riffs and keep the signal alive as the
              tempo climbs, or switch to Jam and just play a chord.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-3xl border p-4 md:p-6" style={CARD_STYLE}>
            {/* Mode + read-outs + sound */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2" role="group" aria-label="Mode">
                <Pill active={mode === "riff"} onClick={() => switchMode("riff")}>
                  Riff
                </Pill>
                <Pill active={mode === "jam"} onClick={() => switchMode("jam")}>
                  Jam
                </Pill>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                {mode === "riff" && (
                  <p className="whitespace-nowrap">
                    score <span style={{ color: "var(--fg)" }}>{fmt(hud.score)}</span>
                    <span className="mx-1.5" style={{ color: "var(--line)" }}>|</span>
                    combo <span style={{ color: "var(--fg)" }}>×{hud.combo}</span>
                    <span className="mx-1.5" style={{ color: "var(--line)" }}>|</span>
                    best <span style={{ color: "var(--fg)" }}>{fmt(best)}</span>
                  </p>
                )}
                <Pill active={sound} onClick={toggleSound}>
                  {sound ? "sound on" : "sound off"}
                </Pill>
              </div>
            </div>

            {/* Riff picker + speed bar, or chord picker */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {mode === "jam" ? (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Chord">
                  {JAM_CHORDS.map((c, i) => (
                    <Pill key={c.name} active={i === chordIdx} onClick={() => { setChordIdx(i); kick(50) }} title={`${i + 1}`}>
                      {c.name}
                    </Pill>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Riff">
                    {RIFFS.map((r, i) => (
                      <Pill key={r.id} active={i === riffIdx} onClick={() => switchRiff(i)} title={`${r.blurb} · ${bpmAt(r)} bpm`}>
                        {r.name}
                      </Pill>
                    ))}
                  </div>
                  <label className="ml-auto flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                    <span>speed</span>
                    <input
                      type="range"
                      min={0}
                      max={SPEEDS.length - 1}
                      step={1}
                      value={speed}
                      onChange={(e) => changeSpeed(Number(e.target.value))}
                      aria-valuetext={SPEED_LABELS[speed]}
                      className="h-1 w-24 cursor-pointer md:w-32"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span className="w-14" style={{ color: "var(--fg)" }}>
                      {SPEED_LABELS[speed]}
                    </span>
                  </label>
                </>
              )}
            </div>

            {/* Board */}
            <div
              ref={boardRef}
              role="application"
              aria-label={mode === "jam" ? "Pocket guitar" : "Riff board"}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
              onPointerDown={onPointerDown}
              onMouseEnter={() => (hovered.current = true)}
              onMouseLeave={() => (hovered.current = false)}
              className="relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={
                  mode === "jam"
                    ? `Four guitar strings tuned to ${chord.name}. Press D, F, J or K, or tap a string, to pluck it.`
                    : `${riff.name}: notes slide along four strings toward a fret line. Press D, F, J or K, or tap a string, as each note reaches it.`
                }
                className="block w-full rounded-xl touch-manipulation"
                style={{ background: "var(--bg)" }}
              />
              {mode === "riff" && status !== "running" && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                  <p className="font-display text-xl md:text-2xl" style={{ color: "var(--fg)" }}>
                    {status === "paused" ? "Paused." : summary ? "Signal lost." : riff.name}
                  </p>
                  <p className="font-mono text-xs" style={{ color: "var(--muted)" }}>
                    {status === "paused"
                      ? `${isTouch ? "tap" : "space"} to resume`
                      : summary
                        ? `score ${fmt(summary.score)} · ${summary.acc}% hit · best combo ×${summary.combo}${summary.loops ? ` · ${summary.loops} loop${summary.loops > 1 ? "s" : ""} cleared` : ""} · ${isTouch ? "tap" : "space"} to retry`
                        : `${riff.blurb} · ${bpmAt(riff)} bpm · ${isTouch ? "tap the board" : "space"} to start`}
                  </p>
                </div>
              )}
            </div>

            {mode === "riff" && (
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full" style={{ background: "rgb(var(--fg-rgb) / 0.1)" }} aria-hidden="true">
                <div
                  className="h-full rounded-full transition-[width] duration-150"
                  style={{ width: `${Math.round(hud.health * 100)}%`, background: hud.health <= 0.4 ? "var(--ember)" : "var(--accent)" }}
                />
              </div>
            )}

            <p className="mt-3 font-mono text-xs" style={{ color: "var(--muted)" }}>
              {hint}
            </p>
            <p role="status" aria-live="polite" className="sr-only">
              {announce}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
