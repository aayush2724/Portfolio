/**
 * Canvas renderer for the riff games: four strings, the fret line, notes
 * sliding in from the right, string vibration on each pluck and the
 * judgement flash. Used by the Pluck It section;
 * colours come from the site tokens on :root.
 */
import { STRINGS, visibleNotes } from "./riff"

const MONO = '"JetBrains Mono", ui-monospace, monospace'
const DISPLAY = '"Clash Display", sans-serif'
export const KEY_LABELS = ["D", "F", "J", "K"]
// Notes never travel further than this, whatever the canvas width: on a wide
// board they fade in part-way across instead of racing the full width.
const MAX_TRAVEL = 720

export function createRiffRenderer(canvas, { touch = false, reduced = false, shimmer = true } = {}) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  const css = getComputedStyle(document.documentElement)
  const token = (name, fallback) => css.getPropertyValue(name).trim() || fallback
  const tokens = {
    accent: token("--accent", "#d4ff3f"),
    accentRgb: token("--accent-rgb", "212 255 63"),
    fg: token("--fg", "#f3f3f5"),
    muted: token("--muted", "#92929c"),
    ember: token("--ember", "#ff9900"),
  }
  let W = 0
  let H = 0
  let fretX = 0

  function resize() {
    const w = canvas.clientWidth
    if (!w) return false
    const h = Math.round(Math.min(230, Math.max(176, w * 0.32)))
    canvas.style.height = `${h}px`
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    W = w
    H = h
    fretX = touch ? 44 : 72
    return true
  }

  const stringY = (s) => (H / STRINGS) * (s + 0.5)

  /** Which string a pointer at viewport `clientY` lands on. */
  function stringAt(clientY) {
    const rect = canvas.getBoundingClientRect()
    return Math.min(STRINGS - 1, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * STRINGS)))
  }

  /**
   * @param game   engine state (riff.js)
   * @param now    clock the game runs on
   * @param jam    true hides the fret and notes — strings only, for free play
   * @param label  faint caption on the right (jam chord name)
   */
  function draw(game, now, { jam = false, label = "" } = {}) {
    if (!W || !H) return
    ctx.clearRect(0, 0, W, H)
    const running = game.status === "running"
    const showNotes = !jam && (running || game.status === "paused")

    if (label) {
      ctx.save()
      ctx.globalAlpha = 0.07
      ctx.fillStyle = tokens.fg
      ctx.font = `400 ${Math.round(H * 0.7)}px ${DISPLAY}`
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText(label, W - 18, H / 2 + 4)
      ctx.restore()
    }

    if (!jam) {
      ctx.fillStyle = `rgb(${tokens.accentRgb} / 0.18)`
      ctx.fillRect(fretX - 1, 0, 2, H)
    }
    ctx.font = `500 11px ${MONO}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    for (let s = 0; s < STRINGS; s++) {
      const y = stringY(s)
      let amp = 0
      let phase = 0
      if (!reduced) {
        for (const p of game.plucks) {
          if (p.s !== s) continue
          const age = now - p.at
          if (age < 320) {
            amp = Math.max(amp, 3.5 * (1 - age / 320))
            phase = age / 18
          }
        }
      }
      ctx.strokeStyle = amp > 0 ? tokens.accent : tokens.muted
      ctx.globalAlpha = amp > 0 ? 0.9 : 0.35
      ctx.lineWidth = 1 + s * 0.6
      ctx.beginPath()
      if (amp > 0) {
        const segs = 40
        for (let i = 0; i <= segs; i++) {
          const x = (W / segs) * i
          const env = Math.sin((i / segs) * Math.PI)
          const dy = Math.sin(i * 0.9 + phase) * amp * env
          if (i === 0) ctx.moveTo(x, y + dy)
          else ctx.lineTo(x, y + dy)
        }
      } else {
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
      }
      ctx.stroke()
      ctx.globalAlpha = 1

      if (!jam) {
        ctx.beginPath()
        ctx.arc(fretX, y, 7, 0, Math.PI * 2)
        ctx.strokeStyle = `rgb(${tokens.accentRgb} / 0.5)`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      if (!touch) {
        ctx.fillStyle = tokens.muted
        ctx.fillText(KEY_LABELS[s], jam ? 18 : fretX - 30, y)
      }
    }

    if (showNotes) {
      const travel = Math.min(W + 12 - fretX, MAX_TRAVEL)
      for (const n of visibleNotes(game, now)) {
        const x = fretX + (1 - n.progress) * travel
        const y = stringY(n.s)
        if (n.judged === "miss") {
          ctx.globalAlpha = 0.35
          ctx.fillStyle = tokens.ember
        } else if (n.judged) {
          continue
        } else {
          ctx.globalAlpha = Math.min(1, n.progress / 0.12)
          ctx.fillStyle = tokens.accent
        }
        ctx.beginPath()
        ctx.arc(x, y, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    const j = game.lastJudgement
    if (!jam && j && now - j.at < 450) {
      const age = (now - j.at) / 450
      const y = stringY(j.s)
      if (j.kind !== "miss" && !reduced) {
        ctx.beginPath()
        ctx.arc(fretX, y, 7 + age * 16, 0, Math.PI * 2)
        ctx.strokeStyle = tokens.accent
        ctx.globalAlpha = 1 - age
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.globalAlpha = 1 - age
      ctx.fillStyle = j.kind === "perfect" ? tokens.accent : j.kind === "good" ? tokens.fg : tokens.ember
      ctx.font = `700 11px ${MONO}`
      ctx.textAlign = "left"
      ctx.fillText(j.kind, fretX + 14, y - 14)
      ctx.globalAlpha = 1
    }

    // Idle: a sketch of where notes will come from
    if (!jam && !running && game.status !== "paused" && shimmer && !reduced) {
      ctx.globalAlpha = 0.25
      ctx.fillStyle = tokens.accent
      for (let i = 0; i < 4; i++) {
        const x = fretX + ((W - fretX) / 5) * (i + 1) + Math.sin(now / 900 + i) * 4
        ctx.beginPath()
        ctx.arc(x, stringY(i), 7, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
  }

  return { resize, draw, stringAt }
}
