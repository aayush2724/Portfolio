import { describe, expect, it } from "vitest"
import {
  APPROACH_MS,
  DEFAULT_SPEED,
  GOOD_MS,
  JAM_CHORDS,
  LOOP_SPEEDUP,
  MISS_COST,
  PERFECT_MS,
  RIFFS,
  STRINGS,
  abandon,
  accuracy,
  bpmForLoop,
  buildLoop,
  createGame,
  judge,
  multiplierFor,
  nextRiff,
  pause,
  pickRiff,
  pluckOnly,
  press,
  readBest,
  readSound,
  readSpeed,
  resume,
  setApproach,
  SPEEDS,
  start,
  step,
  stringFor,
  visibleNotes,
  writeBest,
  writeSound,
  writeSpeed,
} from "./riff"

describe("charts", () => {
  it("every riff is eight bars of eighths on valid strings with real pitches", () => {
    expect(RIFFS.length).toBeGreaterThanOrEqual(3)
    expect(new Set(RIFFS.map((r) => r.id)).size).toBe(RIFFS.length)
    for (const riff of RIFFS) {
      expect(riff.steps).toHaveLength(64)
      expect(riff.bpm).toBeGreaterThan(60)
      expect(riff.steps.filter(Boolean).length).toBeGreaterThan(40)
      for (const n of riff.steps) {
        if (!n) continue
        expect(n[0]).toBeGreaterThanOrEqual(0)
        expect(n[0]).toBeLessThan(STRINGS)
        expect(n[1]).toBeGreaterThan(60)
      }
    }
  })

  it("keeps the first riff steady and lets the second half breathe", () => {
    const steps = RIFFS[0].steps
    expect(steps.slice(0, 32).every(Boolean)).toBe(true)
    expect(steps.slice(32).some((n) => n === null)).toBe(true)
  })

  it("puts lead notes on strings by register and tunes jam chords top-down", () => {
    expect(stringFor(82)).toBe(3)
    expect(stringFor(165)).toBe(2)
    expect(stringFor(220)).toBe(1)
    expect(stringFor(330)).toBe(0)
    for (const c of JAM_CHORDS) {
      expect(c.strings).toHaveLength(STRINGS)
      for (let i = 1; i < STRINGS; i++) expect(c.strings[i]).toBeLessThan(c.strings[i - 1])
    }
  })

  it("lays notes out in time order, spanning one loop, faster each loop", () => {
    const riff = RIFFS[0]
    const a = buildLoop(riff, 0, 1000)
    const beat = 60000 / riff.bpm
    expect(a.lengthMs).toBeCloseTo(32 * beat)
    expect(a.notes[0].t).toBe(1000)
    for (let i = 1; i < a.notes.length; i++) expect(a.notes[i].t).toBeGreaterThan(a.notes[i - 1].t)
    expect(a.notes.at(-1).t).toBeLessThan(1000 + a.lengthMs)
    const b = buildLoop(riff, 1, 0)
    expect(b.lengthMs).toBeCloseTo(a.lengthMs / LOOP_SPEEDUP)
    expect(bpmForLoop(riff, 2)).toBeCloseTo(riff.bpm * LOOP_SPEEDUP ** 2)
  })

  it("cycles and picks riffs without repeating the current one", () => {
    expect(nextRiff(RIFFS[0].id)).toBe(RIFFS[1])
    expect(nextRiff(RIFFS.at(-1).id)).toBe(RIFFS[0])
    for (let i = 0; i < 20; i++) expect(pickRiff(RIFFS[0].id).id).not.toBe(RIFFS[0].id)
    expect(pickRiff(null, () => 0)).toBe(RIFFS[0])
  })
})

describe("judging", () => {
  it("has perfect inside good inside nothing", () => {
    expect(judge(0)).toBe("perfect")
    expect(judge(-PERFECT_MS)).toBe("perfect")
    expect(judge(PERFECT_MS + 1)).toBe("good")
    expect(judge(GOOD_MS)).toBe("good")
    expect(judge(GOOD_MS + 1)).toBeNull()
  })

  it("multiplier grows with combo and caps", () => {
    expect(multiplierFor(0)).toBe(1)
    expect(multiplierFor(9)).toBe(1)
    expect(multiplierFor(10)).toBe(1.5)
    expect(multiplierFor(400)).toBe(3)
  })
})

describe("play", () => {
  it("starts the chosen riff with the first note one approach away", () => {
    const g = createGame()
    expect(press(g, 0, 0)).toBeNull()
    start(g, 0, RIFFS[2])
    expect(g.status).toBe("running")
    expect(g.riff).toBe(RIFFS[2])
    expect(g.notes[0].t).toBe(APPROACH_MS)
  })

  it("scores the nearest note on the pressed string only", () => {
    const g = start(createGame(), 0)
    const first = g.notes[0]
    const wrongString = (first.s + 1) % STRINGS
    expect(press(g, wrongString, first.t)).toBeNull()
    expect(first.judged).toBeNull()
    expect(press(g, first.s, first.t + 20)).toBe("perfect")
    expect(g.lastJudgement.f).toBe(first.f)
    expect(g.score).toBe(100)
    expect(g.combo).toBe(1)
    expect(press(g, first.s, first.t + 25)).toBeNull() // already taken
  })

  it("marks late notes as misses, drains the signal and ends the run", () => {
    const g = start(createGame(), 0)
    const first = g.notes[0]
    expect(step(g, first.t + GOOD_MS)).toEqual([])
    const events = step(g, first.t + GOOD_MS + 1)
    expect(events).toContain("miss")
    expect(first.judged).toBe("miss")
    expect(g.health).toBeCloseTo(1 - MISS_COST)
    expect(g.combo).toBe(0)
    expect(step(g, g.loopStart + g.loopLength + 1000)).toContain("over")
    expect(g.status).toBe("over")
    expect(g.health).toBe(0)
    expect(accuracy(g)).toBe(0)
  })

  it("rolls into a faster loop once every note is judged", () => {
    const g = start(createGame(), 0)
    const firstLoopLength = g.loopLength
    for (const n of g.notes) press(g, n.s, n.t)
    expect(g.hits.perfect).toBe(g.notes.length)
    expect(accuracy(g)).toBe(100)
    expect(step(g, g.loopStart + g.loopLength - 1)).toEqual([])
    expect(step(g, g.loopStart + g.loopLength)).toContain("loop")
    expect(g.loop).toBe(1)
    expect(g.loopsCleared).toBe(1)
    expect(g.loopLength).toBeLessThan(firstLoopLength)
    expect(g.notes.every((n) => !n.judged)).toBe(true)
    expect(g.notes[0].t).toBeCloseTo(firstLoopLength + APPROACH_MS)
  })

  it("survives a loop with a few misses", () => {
    const g = start(createGame(), 0)
    // Play through in time order: every ninth note is let through unplayed.
    g.notes.forEach((n, i) => {
      if (i % 9 === 0) step(g, n.t + GOOD_MS + 1)
      else press(g, n.s, n.t + 10)
    })
    step(g, g.loopStart + g.loopLength)
    expect(g.status).toBe("running")
    expect(g.hits.miss).toBeGreaterThan(0)
    expect(g.loop).toBe(1)
  })

  it("pauses and resumes without losing a note", () => {
    const g = start(createGame(), 0)
    const first = g.notes[0].t
    expect(pause(g, 500)).toBe(true)
    expect(step(g, 5000)).toEqual([]) // nothing expires while paused
    expect(resume(g, 5000)).toBe(true)
    expect(g.notes[0].t).toBe(first + 4500)
    expect(step(g, 5000)).toEqual([])
    expect(pause(g, 0)).toBe(true)
    expect(resume(g, 0)).toBe(true)
    expect(resume(g, 0)).toBe(false)
  })

  it("abandons a run and records jam plucks without scoring", () => {
    const g = start(createGame(), 0)
    abandon(g)
    expect(g.status).toBe("idle")
    expect(g.notes).toEqual([])
    for (let i = 0; i < 12; i++) pluckOnly(g, i % 4, i)
    expect(g.plucks.length).toBeLessThanOrEqual(8)
    expect(g.score).toBe(0)
  })

  it("lets the speed bar change the approach, before and during a run", () => {
    const g = start(createGame(), 0, RIFFS[0], SPEEDS[0])
    expect(g.notes[0].t).toBe(SPEEDS[0])
    expect(visibleNotes(g, 0)[0].progress).toBe(0)
    setApproach(g, SPEEDS[4])
    expect(visibleNotes(g, 0)).toEqual([]) // first note is now beyond the shorter window
    expect(visibleNotes(g, SPEEDS[0] - SPEEDS[4])[0].progress).toBeCloseTo(0)
    expect(start(createGame(), 0).approach).toBe(APPROACH_MS)
    expect(SPEEDS[DEFAULT_SPEED]).toBe(APPROACH_MS)
  })

  it("lists only notes within the approach window with progress toward the fret", () => {
    const g = start(createGame(), 0)
    expect(visibleNotes(g, 0).map((n) => n.progress)).toEqual([0])
    const atFirst = visibleNotes(g, APPROACH_MS)
    expect(atFirst[0].progress).toBeCloseTo(1)
    expect(atFirst.length).toBeGreaterThan(1)
    expect(visibleNotes(g, -APPROACH_MS)).toEqual([])
  })
})

describe("persistence", () => {
  it("keeps a best per riff and tolerates a throwing storage", () => {
    const mem = new Map()
    const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) }
    expect(readBest(storage, "andalusian")).toBe(0)
    writeBest(storage, "andalusian", 4040)
    expect(readBest(storage, "andalusian")).toBe(4040)
    expect(readBest(storage, "pentatonic")).toBe(0)
    expect(readSound(storage)).toBe(true)
    writeSound(storage, false)
    expect(readSound(storage)).toBe(false)
    expect(readSpeed(storage)).toBe(DEFAULT_SPEED)
    writeSpeed(storage, 4)
    expect(readSpeed(storage)).toBe(4)
    writeSpeed(storage, 99)
    expect(readSpeed(storage)).toBe(DEFAULT_SPEED)
    const broken = {
      getItem: () => {
        throw new Error("blocked")
      },
      setItem: () => {
        throw new Error("blocked")
      },
    }
    expect(readBest(broken, "x")).toBe(0)
    expect(readSound(broken)).toBe(true)
    expect(readSpeed(broken)).toBe(DEFAULT_SPEED)
    expect(() => writeSpeed(broken, 1)).not.toThrow()
    expect(() => writeBest(broken, "x", 1)).not.toThrow()
    expect(() => writeSound(broken, true)).not.toThrow()
  })
})
