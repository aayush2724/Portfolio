/**
 * The site's sound: off by default, one switch, remembered per visitor.
 * Everything is synthesised in the browser — no audio files, nothing fetched.
 *
 *   music   an original, slow lead solo in the David Gilmour manner — bends
 *           up into the note, slow vibrato on held notes, light overdrive and
 *           a dotted-eighth echo — over a soft Em–C–G–D pad in a big room.
 *           Written for this site: actual Pink Floyd solos (or any other
 *           copyrighted song) are deliberately not used, since playing one on
 *           a public site needs a licence.
 *   ticks   faint high blips on hovering links/buttons, a softer one on click
 *   doors   the HQ room's doors pluck a note of a soft clean guitar
 *
 * Strings are Karplus-Strong. Audio may only start from a user gesture, so
 * turning it on (a click) builds the graph; a remembered "on" waits for the
 * first click or key press. The context is suspended while the tab is
 * hidden, which also pauses the loop.
 */
const KEY = "sound"
export const SOUND_EVENT = "site-sound"

const HZ = {
  C2: 65.41, D2: 73.42, E2: 82.41, G2: 98, B2: 123.47, C3: 130.81, D3: 146.83, E3: 164.81,
  Fs3: 185, G3: 196, A3: 220, B3: 246.94, D4: 293.66, E4: 329.63, Fs4: 369.99, G4: 392,
  A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
}
const BEAT = 60 / 66 // a slow 66 bpm, 4/4
/** The pad: one chord per bar, bass + a close triad. */
const PAD = [
  ["E2", "E3", "G3", "B3"],
  ["C2", "C3", "E3", "G3"],
  ["G2", "B2", "D3", "G3"],
  ["D2", "D3", "Fs3", "A3"],
  ["E2", "E3", "G3", "B3"],
  ["C2", "C3", "E3", "G3"],
  ["G2", "B2", "D3", "G3"],
  ["D2", "D3", "Fs3", "A3"],
]
/**
 * The lead, an original phrase in E minor pentatonic:
 * [start beat, length in beats, note, bend up from (semitones), vibrato].
 */
const LEAD = [
  [0.5, 2.5, "B4", 2, true], [3, 0.5, "G4"], [3.5, 0.5, "E4"],
  [4, 1.5, "G4", 0, true], [5.5, 0.5, "E4"], [6, 1, "D4"], [7, 1, "E4", 0, true],
  [8.5, 2, "D5", 2, true], [10.5, 0.5, "B4"], [11, 0.5, "A4"], [11.5, 0.5, "G4"],
  [12, 1, "A4"], [13, 0.5, "Fs4"], [13.5, 0.5, "E4"], [14, 2, "D4", 0, true],
  [16.5, 2.5, "E5", 2, true], [19, 0.5, "D5"], [19.5, 0.5, "B4"],
  [20, 1, "D5"], [21, 1, "B4", 1, true], [22, 0.5, "A4"], [22.5, 0.5, "G4"], [23, 1, "E4"],
  [24.5, 1.5, "G4", 1, true], [26, 0.5, "A4"], [26.5, 1.5, "B4", 0, true],
  [28, 0.5, "A4"], [28.5, 0.5, "G4"], [29, 1, "Fs4"], [30, 2, "E4", 0, true],
]
const LOOP_GAP = 0 // seamless: the last held E rings straight into the next round
const MUSIC_LEVEL = 0.12
/** A minor pentatonic for the HQ doors — every note sits inside E minor. */
const DOOR_NOTES = [110, 130.81, 146.83, 164.81, 196, 220, 261.63, 293.66, 329.63]

function readPref() {
  try {
    return (localStorage.getItem(KEY) ?? localStorage.getItem("roomSound")) === "1"
  } catch {
    return false
  }
}

let on = typeof window !== "undefined" ? readPref() : false
let ctx = null
let master = null
let guitarIn = null
let music = null
let lastTick = 0
let lastHover = null
const strings = new Map()

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.9
    const comp = ctx.createDynamicsCompressor()
    master.connect(comp).connect(ctx.destination)
    buildGuitarChain()
  }
  if (ctx.state === "suspended" && document.visibilityState === "visible") ctx.resume()
  return ctx
}

/** Body warmth + a soft room: dry and reverb, both into the master. */
function buildGuitarChain() {
  guitarIn = ctx.createGain()
  const body = ctx.createBiquadFilter()
  body.type = "peaking"
  body.frequency.value = 190
  body.Q.value = 1.1
  body.gain.value = 4
  const soft = ctx.createBiquadFilter()
  soft.type = "highshelf"
  soft.frequency.value = 2800
  soft.gain.value = -7
  guitarIn.connect(body).connect(soft)
  const dry = ctx.createGain()
  dry.gain.value = 0.8
  soft.connect(dry).connect(master)
  // Reverb: 2.6 s of decaying stereo noise as the impulse.
  const len = Math.round(ctx.sampleRate * 2.6)
  const ir = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2)
  }
  const verb = ctx.createConvolver()
  verb.buffer = ir
  const wet = ctx.createGain()
  wet.gain.value = 0.38
  soft.connect(verb).connect(wet).connect(master)
}

/**
 * One string, rendered once per pitch and voice: a noise burst through a
 * damped two-tap loop. "clean" is softened (a thumb) and dies sooner; "lead"
 * is brighter and sustains for seconds, like a driven electric.
 */
function string(freq, voice = "clean") {
  const key = `${voice}:${freq}`
  let buf = strings.get(key)
  if (buf) return buf
  const lead = voice === "lead"
  const rate = ctx.sampleRate
  const n = Math.round(rate / freq)
  buf = ctx.createBuffer(1, Math.round(rate * (lead ? 4.5 : 2.8)), rate)
  const out = buf.getChannelData(0)
  const ring = new Float32Array(n)
  for (let i = 0; i < n; i++) ring[i] = Math.random() * 2 - 1
  for (let pass = 0; pass < (lead ? 1 : 3); pass++) for (let i = 1; i < n; i++) ring[i] = 0.5 * (ring[i] + ring[i - 1])
  const decay = lead ? 0.9993 : freq < 150 ? 0.9975 : 0.9955
  let idx = 0
  for (let i = 0; i < out.length; i++) {
    const cur = ring[idx]
    const next = ring[(idx + 1) % n]
    ring[idx] = decay * 0.5 * (cur + next)
    out[i] = cur
    idx = (idx + 1) % n
  }
  strings.set(key, buf)
  return buf
}

/** A clean pluck (the HQ doors). */
function play(freq, when, velocity, bus = guitarIn) {
  const src = ctx.createBufferSource()
  src.buffer = string(freq)
  const g = ctx.createGain()
  g.gain.value = velocity
  src.connect(g).connect(bus)
  src.start(when)
}

/** Humanised: a few milliseconds of timing and a little velocity give it a hand. */
const jitter = (s) => (Math.random() * 2 - 1) * s

/** The lead's amp: soft overdrive, a tone cut, and a dotted-eighth echo with darker repeats. */
function leadChain(c, into) {
  const input = c.createGain()
  const drive = c.createWaveShaper()
  const curve = new Float32Array(1024)
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1
    curve[i] = Math.tanh(2.2 * x) / Math.tanh(2.2)
  }
  drive.curve = curve
  drive.oversample = "2x"
  const tone = c.createBiquadFilter()
  tone.type = "lowpass"
  tone.frequency.value = 2600
  tone.Q.value = 0.6
  input.connect(drive).connect(tone)
  tone.connect(into)
  const delay = c.createDelay(2)
  delay.delayTime.value = BEAT * 0.75
  const fb = c.createGain()
  fb.gain.value = 0.34
  const dark = c.createBiquadFilter()
  dark.type = "lowpass"
  dark.frequency.value = 1800
  const wet = c.createGain()
  wet.gain.value = 0.32
  tone.connect(delay)
  delay.connect(dark).connect(fb).connect(delay)
  dark.connect(wet).connect(into)
  return input
}

/** One lead note: bend up into it, hold with slow vibrato, release. */
function leadNote(c, chain, t, beats, freq, bend, vibrato) {
  const end = t + beats * BEAT
  const src = c.createBufferSource()
  src.buffer = string(freq, "lead")
  if (bend) {
    src.detune.setValueAtTime(-bend * 100, t)
    src.detune.linearRampToValueAtTime(0, t + 0.24)
  }
  if (vibrato && beats >= 1) {
    const lfo = c.createOscillator()
    lfo.frequency.value = 5.2
    const depth = c.createGain()
    depth.gain.setValueAtTime(0, t)
    depth.gain.linearRampToValueAtTime(22, t + 0.6)
    lfo.connect(depth).connect(src.detune)
    lfo.start(t)
    lfo.stop(end + 0.4)
  }
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.5 * (1 + jitter(0.1)), t + 0.012)
  g.gain.setTargetAtTime(0, end, 0.12)
  src.connect(g).connect(chain)
  src.start(t)
  src.stop(end + 0.8)
}

/** One pad chord: slow swell, slow fade, very quiet. */
function padChord(c, bus, t, beats, notes) {
  const end = t + beats * BEAT
  const lp = c.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.value = 850
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.05, t + 1.4)
  g.gain.setTargetAtTime(0, end - 0.2, 0.6)
  lp.connect(g).connect(bus)
  notes.forEach((n, k) => {
    const o = c.createOscillator()
    o.type = k ? "triangle" : "sine"
    o.frequency.value = HZ[n]
    o.detune.value = jitter(6)
    o.connect(lp)
    o.start(t)
    o.stop(end + 3)
  })
}

function startMusic() {
  const c = audio()
  if (!c || music) return
  const bus = c.createGain()
  bus.gain.value = 0
  bus.connect(guitarIn)
  bus.gain.setTargetAtTime(MUSIC_LEVEL, c.currentTime, 1.5)
  const lead = leadChain(c, bus)
  // Flatten pad + lead into one timed list once.
  const events = [
    ...PAD.map((chord, bar) => ({ t: bar * 4 * BEAT, run: (at) => padChord(c, bus, at, 4, chord) })),
    ...LEAD.map(([beat, len, note, bend = 0, vib = false]) => ({
      t: beat * BEAT,
      run: (at) => leadNote(c, lead, at + Math.abs(jitter(0.015)), len, HZ[note], bend, vib),
    })),
  ].sort((a, b) => a.t - b.t)
  const length = PAD.length * 4 * BEAT + LOOP_GAP
  let loopStart = c.currentTime + 0.5
  let i = 0
  // Lookahead scheduler: every 200 ms, queue whatever falls in the next second.
  const timer = setInterval(() => {
    while (true) {
      if (i >= events.length) {
        i = 0
        loopStart += length
      }
      const at = loopStart + events[i].t
      if (at > c.currentTime + 1) break
      if (at > c.currentTime - 0.05) events[i].run(at)
      i++
    }
  }, 200)
  music = {
    stop() {
      clearInterval(timer)
      bus.gain.setTargetAtTime(0, c.currentTime, 0.4)
      setTimeout(() => bus.disconnect(), 3500)
    },
  }
}

function stopMusic() {
  music?.stop()
  music = null
}

/** A faint blip: "hover" high and short, "click" lower and rounder. */
function tick(kind) {
  if (!on || !ctx || ctx.state !== "running") return
  const now = performance.now()
  if (now - lastTick < 45) return
  lastTick = now
  const t = ctx.currentTime
  const click = kind === "click"
  const o = ctx.createOscillator()
  o.type = "sine"
  o.frequency.setValueAtTime(click ? 880 : 1760, t)
  o.frequency.exponentialRampToValueAtTime(click ? 440 : 1320, t + 0.04)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(click ? 0.04 : 0.012, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + (click ? 0.09 : 0.05))
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + 0.1)
}

const INTERACTIVE = "a[href], button, [role='button'], summary, input[type='range']"

function onPointerOver(e) {
  if (e.pointerType && e.pointerType !== "mouse") return
  const el = e.target.closest?.(INTERACTIVE)
  if (el === lastHover) return
  lastHover = el
  if (el) tick("hover")
}
function onClick(e) {
  if (e.target.closest?.(INTERACTIVE)) tick("click")
}
function onVisibility() {
  if (!ctx) return
  if (document.visibilityState === "hidden") ctx.suspend()
  else if (on) ctx.resume()
}
/**
 * A remembered "on" can only start sounding after a gesture the browser
 * accepts for audio: a click, a key, or the end of a tap (pointerdown does
 * not count for touch). Stay attached until the context is really running.
 */
const GESTURES = ["click", "touchend", "keydown"]
function detachGestures() {
  GESTURES.forEach((g) => window.removeEventListener(g, onFirstGesture, true))
}
function onFirstGesture() {
  if (!on) return detachGestures()
  begin()
  if (ctx?.state === "running") return detachGestures()
  ctx?.resume().then(() => ctx.state === "running" && detachGestures(), () => {})
}

function begin() {
  audio()
  startMusic()
  document.addEventListener("pointerover", onPointerOver, { passive: true })
  document.addEventListener("click", onClick, true)
}

function end() {
  stopMusic()
  document.removeEventListener("pointerover", onPointerOver)
  document.removeEventListener("click", onClick, true)
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", onVisibility)
  if (on) GESTURES.forEach((g) => window.addEventListener(g, onFirstGesture, true))
}

export function soundOn() {
  return on
}

/** Call from the toggle's click — the audio graph may only start on a gesture. */
export function setSound(next) {
  on = Boolean(next)
  try {
    localStorage.setItem(KEY, on ? "1" : "0")
  } catch {
    // storage unavailable — the choice lasts for this page only
  }
  if (on) begin()
  else end()
  window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: { on } }))
}

/** Pluck door note `index` on the same guitar (the HQ room). */
export function pluckNote(index, gain = 0.25) {
  if (!on || index < 0 || !ctx || ctx.state !== "running") return
  play(DOOR_NOTES[index % DOOR_NOTES.length], ctx.currentTime, gain * 0.5)
}
