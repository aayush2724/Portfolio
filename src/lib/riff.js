/**
 * Riff engine — the rhythm-game logic behind the Pluck It section. No canvas,
 * DOM or audio in here.
 *
 * Four guitar strings run across the canvas. Notes travel toward a fret
 * line; the player plucks the right string as each note crosses it. Every
 * riff is an original 8-bar chart that loops faster each time round. One miss
 * drains the signal bar; it empties, the run ends.
 *
 * Times are ms on whatever clock the caller passes to `step`/`press`
 * (performance.now in the page, plain numbers in tests).
 */

export const STRINGS = 4 // 0 = top/thinnest, 3 = bottom/thickest
// The speed bar picks one of these presets. `tempo` scales the riff's bpm, so
// notes arrive less often as well as travelling slower; `approach` is how long
// a note is visible before the fret line. Sized so five or six notes share the
// board at any speed.
export const SPEEDS = [
  { label: "slow", tempo: 0.45, approach: 3400 },
  { label: "easy", tempo: 0.65, approach: 2800 },
  { label: "normal", tempo: 0.85, approach: 2300 },
  { label: "quick", tempo: 1.05, approach: 1900 },
  { label: "fast", tempo: 1.25, approach: 1500 },
]
export const SPEED_LABELS = SPEEDS.map((s) => s.label)
export const DEFAULT_SPEED = 2
export const APPROACH_MS = SPEEDS[DEFAULT_SPEED].approach // default: a note is visible for this long before the fret line
export const DEFAULT_TEMPO = SPEEDS[DEFAULT_SPEED].tempo
export const PERFECT_MS = 50
export const GOOD_MS = 130
export const LOOP_SPEEDUP = 1.08
export const BEATS_PER_LOOP = 32 // 8 bars of 4/4
export const MISS_COST = 0.2
export const HIT_GAIN = 0.04
export const SCORE = { perfect: 100, good: 60 }
export const MAX_MULTIPLIER = 3

// Pitches (Hz) for the pluck synth.
export const Hz = {
  E2: 82.41, F2: 87.31, G2: 98.0, Gs2: 103.83, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, Gs3: 207.65,
  A3: 220.0, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
}

/* ── charts ─────────────────────────────────────────────────────────────────
   A chart is 64 eighth-note steps (8 bars). Each step is [string, Hz] or null
   for a rest. The string a note sits on is visual; the pitch is what sounds. */
const _ = null

// Chord tones for the arpeggio riffs, low to high.
const CH = {
  C: { root: Hz.C3, fifth: Hz.G3, oct: Hz.C4, third: Hz.E4, top: Hz.G4 },
  G: { root: Hz.G2, fifth: Hz.D3, oct: Hz.G3, third: Hz.B3, top: Hz.D4 },
  Am: { root: Hz.A2, fifth: Hz.E3, oct: Hz.A3, third: Hz.C4, top: Hz.E4 },
  F: { root: Hz.F2, fifth: Hz.C3, oct: Hz.F3, third: Hz.A3, top: Hz.C4 },
  E: { root: Hz.E2, fifth: Hz.B2, oct: Hz.E3, third: Hz.Gs3, top: Hz.B3 },
}
// Bar patterns. First half of a riff is steady; the second half breathes.
const roll = (c) => [[3, c.root], [2, c.fifth], [1, c.oct], [0, c.third], [1, c.oct], [2, c.fifth], [1, c.oct], [0, c.top]]
const push = (c) => [[3, c.root], _, [1, c.oct], [0, c.third], _, [1, c.oct], [0, c.top], [0, c.third]]
const strum = (c) => [[3, c.root], [1, c.oct], [0, c.top], [1, c.oct], [2, c.fifth], _, [0, c.third], [1, c.oct]]
const chop = (c) => [[3, c.root], _, [0, c.top], [0, c.third], _, [1, c.oct], [2, c.fifth], _]

// Single-note lines sit on a string by register.
export const stringFor = (f) => (f < 115 ? 3 : f < 190 ? 2 : f < 275 ? 1 : 0)
const lead = (...freqs) => freqs.map((f) => (f ? [stringFor(f), f] : null))

export const RIFFS = [
  {
    id: "andalusian",
    name: "Andalusian",
    blurb: "Am · G · F · E, rolled",
    bpm: 96,
    steps: [...roll(CH.Am), ...roll(CH.G), ...roll(CH.F), ...roll(CH.E), ...push(CH.Am), ...push(CH.G), ...push(CH.F), ...push(CH.E)],
  },
  {
    id: "four-chords",
    name: "Four Chords",
    blurb: "C · G · Am · F, the pop loop",
    bpm: 104,
    steps: [...strum(CH.C), ...strum(CH.G), ...strum(CH.Am), ...strum(CH.F), ...chop(CH.C), ...chop(CH.G), ...chop(CH.Am), ...chop(CH.F)],
  },
  {
    id: "pentatonic",
    name: "Pentatonic Run",
    blurb: "E minor pentatonic, single notes",
    bpm: 112,
    steps: lead(
      Hz.E2, Hz.G2, Hz.A2, Hz.B2, Hz.D3, Hz.E3, _, Hz.E3,
      Hz.G3, Hz.A3, Hz.B3, _, Hz.A3, Hz.G3, Hz.E3, _,
      Hz.D3, Hz.E3, Hz.G3, Hz.A3, Hz.B3, _, Hz.A3, Hz.G3,
      Hz.E3, Hz.D3, Hz.B2, Hz.A2, Hz.G2, _, Hz.E2, _,
      Hz.E3, _, Hz.G3, _, Hz.A3, Hz.B3, _, Hz.D4,
      Hz.E4, _, Hz.D4, Hz.B3, _, Hz.A3, Hz.G3, _,
      Hz.A3, Hz.B3, Hz.D4, _, Hz.B3, Hz.A3, Hz.G3, Hz.E3,
      Hz.D3, _, Hz.B2, _, Hz.A2, Hz.G2, Hz.E2, _,
    ),
  },
]

/** Open-string tunings for jam mode, top string first (highest pitch at index 0). */
export const JAM_CHORDS = [
  { name: "Am", strings: [Hz.C4, Hz.A3, Hz.E3, Hz.A2] },
  { name: "C", strings: [Hz.E4, Hz.C4, Hz.G3, Hz.C3] },
  { name: "Dm", strings: [Hz.F4, Hz.D4, Hz.A3, Hz.D3] },
  { name: "Em", strings: [Hz.G3, Hz.E3, Hz.B2, Hz.E2] },
  { name: "F", strings: [Hz.A3, Hz.F3, Hz.C3, Hz.F2] },
  { name: "G", strings: [Hz.B3, Hz.G3, Hz.D3, Hz.G2] },
]

export function riffById(id) {
  return RIFFS.find((r) => r.id === id) || RIFFS[0]
}

/** A riff other than `exceptId` (or any riff when there is nothing to avoid). */
export function pickRiff(exceptId, random = Math.random) {
  const pool = RIFFS.filter((r) => r.id !== exceptId)
  return pool[Math.floor(random() * pool.length)] || RIFFS[0]
}

export function nextRiff(id) {
  const i = RIFFS.findIndex((r) => r.id === id)
  return RIFFS[(i + 1) % RIFFS.length]
}

/** The riff's bpm at a speed-bar tempo, after `loop` rounds of speed-up. */
export function bpmForLoop(riff, loop, tempo = 1) {
  return riff.bpm * tempo * Math.pow(LOOP_SPEEDUP, loop)
}

/**
 * Notes for one pass of a riff, starting at `startMs`. Each eighth is half a
 * beat; the loop's length in ms is returned so the next one can follow on.
 */
export function buildLoop(riff, loop, startMs, tempo = 1) {
  const beatMs = 60000 / bpmForLoop(riff, loop, tempo)
  const notes = []
  riff.steps.forEach((stepNote, i) => {
    if (!stepNote) return
    const [string, freq] = stepNote
    notes.push({ t: startMs + i * 0.5 * beatMs, s: string, f: freq, loop, judged: null })
  })
  return { notes, lengthMs: BEATS_PER_LOOP * beatMs }
}

export function judge(dtMs) {
  const a = Math.abs(dtMs)
  if (a <= PERFECT_MS) return "perfect"
  if (a <= GOOD_MS) return "good"
  return null
}

export function multiplierFor(combo) {
  return Math.min(MAX_MULTIPLIER, 1 + Math.floor(combo / 10) * 0.5)
}

export function createGame() {
  return {
    status: "idle", // idle | running | paused | over
    riff: RIFFS[0],
    approach: APPROACH_MS,
    tempo: DEFAULT_TEMPO,
    notes: [],
    loop: 0,
    loopStart: 0,
    loopLength: 0,
    loopsCleared: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    health: 1,
    hits: { perfect: 0, good: 0, miss: 0 },
    lastJudgement: null, // { kind, s, at }
    plucks: [], // { s, at } for the string-wobble renderer
    pausedAt: 0,
  }
}

export function start(game, now, riff = game.riff, speed = game) {
  const { approach, tempo } = speed
  Object.assign(game, createGame(), { status: "running", riff, approach, tempo })
  queueLoop(game, now + approach)
  return game
}

/**
 * Switch speed preset. Applies at once, even mid-run: notes still to come are
 * re-spaced around the present moment (the pause point while paused) so the
 * chart neither bunches up nor skips, and the loop end moves with them. Notes
 * already past the fret keep their time, so a change never causes a miss.
 */
export function applySpeed(game, { approach, tempo }, now) {
  const prev = game.tempo
  game.approach = approach
  game.tempo = tempo
  const live = game.status === "running" || game.status === "paused"
  if (!live || prev === tempo) return game
  const pivot = game.status === "paused" ? game.pausedAt : now
  const k = prev / tempo
  for (const n of game.notes) {
    if (!n.judged && n.t > pivot) n.t = pivot + (n.t - pivot) * k
  }
  const end = game.loopStart + game.loopLength
  if (end > pivot) game.loopLength = pivot + (end - pivot) * k - game.loopStart
  return game
}

/** Drop the current run without scoring it (switching riff or mode). */
export function abandon(game) {
  game.status = "idle"
  game.notes = []
  game.lastJudgement = null
  return game
}

function queueLoop(game, startMs) {
  const { notes, lengthMs } = buildLoop(game.riff, game.loop, startMs, game.tempo)
  game.notes = notes
  game.loopStart = startMs
  game.loopLength = lengthMs
}

/** Record a pluck for the renderer without judging it (jam mode). */
export function pluckOnly(game, s, now) {
  game.plucks.push({ s, at: now })
  if (game.plucks.length > 8) game.plucks.splice(0, game.plucks.length - 8)
}

/** Judge the pluck on string `s` at time `now`. Returns the judgement or null (no note nearby). */
export function press(game, s, now) {
  if (game.status !== "running") return null
  let best = null
  for (const n of game.notes) {
    if (n.judged || n.s !== s) continue
    const dt = now - n.t
    if (Math.abs(dt) > GOOD_MS) continue
    if (!best || Math.abs(dt) < Math.abs(now - best.t)) best = n
  }
  pluckOnly(game, s, now)
  if (!best) return null
  const kind = judge(now - best.t)
  best.judged = kind
  game.hits[kind]++
  game.combo++
  game.bestCombo = Math.max(game.bestCombo, game.combo)
  game.score += Math.round(SCORE[kind] * multiplierFor(game.combo))
  game.health = Math.min(1, game.health + HIT_GAIN)
  game.lastJudgement = { kind, s, at: now, f: best.f }
  return kind
}

/** Advance the clock: expire unplayed notes, roll into the next loop, end the run. Returns events. */
export function step(game, now) {
  const events = []
  if (game.status !== "running") return events

  for (const n of game.notes) {
    if (n.judged || now - n.t <= GOOD_MS) continue
    n.judged = "miss"
    game.hits.miss++
    game.combo = 0
    game.health -= MISS_COST
    game.lastJudgement = { kind: "miss", s: n.s, at: now }
    events.push("miss")
    if (game.health <= 0) {
      game.health = 0
      game.status = "over"
      events.push("over")
      return events
    }
  }

  if (now >= game.loopStart + game.loopLength && game.notes.every((n) => n.judged)) {
    game.loopsCleared++
    game.loop++
    events.push("loop")
    queueLoop(game, game.loopStart + game.loopLength)
  }
  return events
}

export function pause(game, now) {
  if (game.status !== "running") return false
  game.status = "paused"
  game.pausedAt = now
  return true
}

/** Resume, shifting every pending note by the time spent paused so nothing is instantly missed. */
export function resume(game, now) {
  if (game.status !== "paused") return false
  const gap = now - game.pausedAt
  for (const n of game.notes) n.t += gap
  game.loopStart += gap
  game.status = "running"
  return true
}

/** Notes currently on screen, with 0..1 progress toward the fret line (1 = on it, >1 = past). */
export function visibleNotes(game, now) {
  const out = []
  for (const n of game.notes) {
    const until = n.t - now
    if (until > game.approach || until < -GOOD_MS - 150) continue
    out.push({ ...n, progress: 1 - until / game.approach })
  }
  return out
}

export function accuracy(game) {
  const total = game.hits.perfect + game.hits.good + game.hits.miss
  return total ? Math.round(((game.hits.perfect + game.hits.good) / total) * 100) : 0
}

/* ── persistence ────────────────────────────────────────────────────────────
   Storage can throw (private mode, blocked site data); the game works without it.
   Bests are per riff. */
export const SOUND_KEY = "riff.sound"
export const SPEED_KEY = "riff.speed"
export const bestKey = (riffId) => `riff.best.${riffId}`

export function readBest(storage, riffId) {
  try {
    return Number(storage.getItem(bestKey(riffId))) || 0
  } catch {
    return 0
  }
}
export function writeBest(storage, riffId, n) {
  try {
    storage.setItem(bestKey(riffId), String(n))
  } catch {
    /* best score just won't persist */
  }
}
export function readSpeed(storage) {
  try {
    const raw = storage.getItem(SPEED_KEY)
    if (raw === null || raw === "") return DEFAULT_SPEED
    const n = Number(raw)
    return Number.isInteger(n) && n >= 0 && n < SPEEDS.length ? n : DEFAULT_SPEED
  } catch {
    return DEFAULT_SPEED
  }
}
export function writeSpeed(storage, i) {
  try {
    storage.setItem(SPEED_KEY, String(i))
  } catch {
    /* preference just won't persist */
  }
}
export function readSound(storage) {
  try {
    return storage.getItem(SOUND_KEY) !== "off"
  } catch {
    return true
  }
}
export function writeSound(storage, on) {
  try {
    storage.setItem(SOUND_KEY, on ? "on" : "off")
  } catch {
    /* preference just won't persist */
  }
}
