import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Reveal from "./Reveal"
import CommandLabel from "./CommandLabel"
import AnimatedHeading from "./AnimatedHeading"
import { LADDER, SIZE, WIN_LEVEL, canMove, maxLevel, move, newBoard, spawn, valueOf } from "../data/stack2048"

// Board geometry, in % of the board's width: SIZE cells with GAP between and around them.
const GAP = 2.6
const CELL = (100 - GAP * (SIZE + 1)) / SIZE
// A tile is CELL wide, so one step of (CELL + GAP) is this % of its own width.
const STEP = ((CELL + GAP) / CELL) * 100

/** Tile colours climb from neutral to the accent; the top two glow. */
const STYLE = [
  null,
  { bg: "rgba(255,255,255,0.06)", fg: "var(--fg)" },
  { bg: "rgba(255,255,255,0.11)", fg: "var(--fg)" },
  { bg: "rgba(212,255,63,0.12)", fg: "var(--fg)" },
  { bg: "rgba(212,255,63,0.2)", fg: "var(--fg)" },
  { bg: "rgba(212,255,63,0.3)", fg: "var(--fg)" },
  { bg: "rgba(212,255,63,0.42)", fg: "var(--fg)" },
  { bg: "rgba(212,255,63,0.58)", fg: "var(--accent-ink)" },
  { bg: "rgba(212,255,63,0.72)", fg: "var(--accent-ink)" },
  { bg: "rgba(212,255,63,0.86)", fg: "var(--accent-ink)" },
  { bg: "var(--accent)", fg: "var(--accent-ink)", glow: "0 0 24px rgba(212,255,63,0.45)" },
  { bg: "linear-gradient(135deg, #ff9900, #d4ff3f)", fg: "var(--accent-ink)", glow: "0 0 32px rgba(255,153,0,0.55)" },
]

const KEYS = {
  ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
  a: "left", d: "right", w: "up", s: "down", A: "left", D: "right", W: "up", S: "down",
}

const BEST_KEY = "stack2048.best"
const TOP_KEY = "stack2048.top"

// Storage can throw (private mode, blocked site data) — the game works without it.
const readNum = (key) => {
  try {
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}
const writeNum = (key, n) => {
  try {
    localStorage.setItem(key, String(n))
  } catch {
    /* best score just won't persist */
  }
}

/** Shrink long names so "LangChain" fits the tile that "JS" fills. */
const fontFor = (name) => (name.length <= 3 ? 5.6 : name.length <= 5 ? 4.4 : name.length <= 7 ? 3.4 : 2.8)

/**
 * "Stack 2048" — 2048 where each merge climbs the stack I build with, from
 * HTML to Shipped. Rules live in src/data/stack2048.js; this is the board.
 *
 * Arrow keys / WASD only steer the game while the board is hovered or focused,
 * so they never hijack page scrolling; on touch the board takes swipes.
 */
export default function Stack2048() {
  const nextId = useRef(0)
  const id = useCallback(() => ++nextId.current, [])
  const [game, setGame] = useState(() => ({
    tiles: newBoard(id),
    score: 0,
    gained: null, // { key, points } for the floating "+n"
    won: false,
    keepGoing: false,
  }))
  const [best, setBest] = useState(() => readNum(BEST_KEY))
  const [top, setTop] = useState(() => readNum(TOP_KEY))
  const [announce, setAnnounce] = useState("")
  const boardRef = useRef(null)
  const hovered = useRef(false)
  const swipe = useRef(null)
  const reduce = useReducedMotion()

  const live = game.tiles.filter((t) => !t.dying)
  const level = maxLevel(game.tiles)
  const over = !canMove(game.tiles)
  const paused = over || (game.won && !game.keepGoing)

  const act = useCallback(
    (dir) => {
      setGame((prev) => {
        if (!canMove(prev.tiles) || (prev.won && !prev.keepGoing)) return prev
        const { tiles, moved, gained } = move(prev.tiles, dir)
        if (!moved) return prev
        const next = spawn(tiles, id)
        return {
          ...prev,
          tiles: next,
          score: prev.score + gained,
          gained: gained ? { key: next.length + prev.score, points: gained } : prev.gained,
          won: prev.won || maxLevel(next) >= WIN_LEVEL,
        }
      })
    },
    [id],
  )

  // Absorbed tiles slide into their partner, then leave.
  useEffect(() => {
    if (!game.tiles.some((t) => t.dying)) return
    const t = setTimeout(() => setGame((g) => ({ ...g, tiles: g.tiles.filter((x) => !x.dying) })), 140)
    return () => clearTimeout(t)
  }, [game.tiles])

  // Best score and furthest tile ever reached persist across visits.
  useEffect(() => {
    if (game.score > best) {
      setBest(game.score)
      writeNum(BEST_KEY, game.score)
    }
    if (level > top) {
      setTop(level)
      writeNum(TOP_KEY, level)
      if (level > 2) setAnnounce(`Unlocked ${LADDER[level].name}.`)
    }
  }, [game.score, level, best, top])

  useEffect(() => {
    if (over) setAnnounce(`No moves left. Final score ${game.score}.`)
    else if (game.won && !game.keepGoing) setAnnounce("Shipped! You reached the top of the stack.")
  }, [over, game.won, game.keepGoing, game.score])

  useEffect(() => {
    const onKey = (e) => {
      const dir = KEYS[e.key]
      if (!dir || e.metaKey || e.ctrlKey || e.altKey) return
      const focused = boardRef.current && boardRef.current === document.activeElement
      if (!focused && !hovered.current) return
      e.preventDefault()
      act(dir)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [act])

  const onPointerDown = (e) => {
    swipe.current = { x: e.clientX, y: e.clientY }
    boardRef.current?.focus({ preventScroll: true })
  }
  const onPointerUp = (e) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    act(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up")
  }

  const restart = () => {
    setGame({ tiles: newBoard(id), score: 0, gained: null, won: false, keepGoing: false })
    setAnnounce("New game.")
    boardRef.current?.focus({ preventScroll: true })
  }

  const slide = reduce ? { duration: 0 } : { type: "tween", ease: "easeOut", duration: 0.12 }

  return (
    <section id="play" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl 2xl:max-w-[88vw]">
        <Reveal>
          <CommandLabel className="mb-6">npx stack-2048</CommandLabel>
        </Reveal>

        <Reveal>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
                Mini game
              </p>
              <AnimatedHeading
                text="Ship It"
                decode
                as="h2"
                className="font-display text-5xl md:text-7xl uppercase leading-none"
              />
            </div>
            <p className="max-w-xl text-sm md:text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              2048, but every merge climbs the stack I build with — from HTML all the way to Shipped 🚀.
              Hover the board and use the arrow keys, or swipe.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,460px)_1fr] lg:items-start">
            {/* Board */}
            <div className="mx-auto w-full max-w-[460px]">
              <div className="flex items-stretch gap-3 mb-4 font-mono">
                <Score label="Score" value={game.score} gained={game.gained} />
                <Score label="Best" value={best} />
                <button
                  type="button"
                  onClick={restart}
                  className="ml-auto rounded-2xl border px-4 text-xs uppercase tracking-widest transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{ borderColor: "var(--line)", color: "var(--muted)" }}
                >
                  New game
                </button>
              </div>

              <div
                ref={boardRef}
                // Focusable so keyboard users can play: the board is the control.
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
                role="application"
                aria-label="Stack 2048 board. Use the arrow keys to slide the tiles."
                aria-describedby="stack2048-status"
                data-lenis-prevent
                onMouseEnter={() => (hovered.current = true)}
                onMouseLeave={() => (hovered.current = false)}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={() => (swipe.current = null)}
                className="relative aspect-square w-full select-none rounded-3xl border outline-none focus-visible:border-[var(--accent)]"
                style={{
                  borderColor: "var(--line)",
                  background: "var(--surface)",
                  touchAction: "none",
                  containerType: "inline-size",
                }}
              >
                {/* Empty slots */}
                {Array.from({ length: SIZE * SIZE }, (_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-xl"
                    style={{
                      left: `${GAP + (i % SIZE) * (CELL + GAP)}%`,
                      top: `${GAP + Math.floor(i / SIZE) * (CELL + GAP)}%`,
                      width: `${CELL}%`,
                      height: `${CELL}%`,
                      background: "rgba(255,255,255,0.025)",
                    }}
                  />
                ))}

                {/* Tiles */}
                {game.tiles.map((t) => {
                  const s = STYLE[t.level] ?? STYLE[WIN_LEVEL]
                  const name = LADDER[t.level]?.name ?? "Shipped 🚀"
                  return (
                    <motion.div
                      key={t.id}
                      initial={t.isNew && !reduce ? { scale: 0, x: `${t.c * STEP}%`, y: `${t.r * STEP}%` } : false}
                      animate={{ scale: 1, x: `${t.c * STEP}%`, y: `${t.r * STEP}%` }}
                      transition={t.isNew ? { ...slide, delay: reduce ? 0 : 0.1 } : slide}
                      className="absolute"
                      style={{ left: `${GAP}%`, top: `${GAP}%`, width: `${CELL}%`, height: `${CELL}%`, zIndex: t.dying ? 1 : 2 }}
                    >
                      <motion.div
                        key={t.level}
                        initial={t.merged && !reduce ? { scale: 1.18 } : false}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                        className="relative flex h-full w-full items-center justify-center rounded-xl text-center"
                        style={{ background: s.bg, color: s.fg, boxShadow: s.glow }}
                      >
                        <span
                          className="absolute left-[8%] top-[6%] font-mono opacity-60"
                          style={{ fontSize: "2.1cqw" }}
                        >
                          {valueOf(t.level)}
                        </span>
                        <span className="font-display leading-none px-1" style={{ fontSize: `${fontFor(name)}cqw` }}>
                          {name}
                        </span>
                      </motion.div>
                    </motion.div>
                  )
                })}

                {/* Win / game over */}
                <AnimatePresence>
                  {paused && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-3xl p-6 text-center"
                      style={{ background: "rgba(10,10,11,0.82)", backdropFilter: "blur(4px)" }}
                    >
                      <p className="font-display text-3xl md:text-4xl uppercase" style={{ color: over ? "var(--fg)" : "var(--accent)" }}>
                        {over ? "Build failed" : "Shipped 🚀"}
                      </p>
                      <p className="font-mono text-xs max-w-[28ch]" style={{ color: "var(--muted)" }}>
                        {over
                          ? `No moves left. You got as far as ${LADDER[level]?.name ?? "Shipped"} with ${game.score.toLocaleString()} points.`
                          : "You merged your way to production. Keep going for a higher score?"}
                      </p>
                      <div className="flex gap-3">
                        {!over && (
                          <button
                            type="button"
                            onClick={() => {
                              setGame((g) => ({ ...g, keepGoing: true }))
                              boardRef.current?.focus({ preventScroll: true })
                            }}
                            className="rounded-full border px-5 py-2.5 text-sm"
                            style={{ borderColor: "var(--line)", color: "var(--fg)" }}
                          >
                            Keep going
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={restart}
                          className="rounded-full px-5 py-2.5 text-sm font-semibold"
                          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
                        >
                          {over ? "Try again" : "New game"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="mt-3 font-mono text-[11px] text-center" style={{ color: "var(--muted)" }}>
                <span className="hidden md:inline">hover the board · ← ↑ → ↓ or WASD</span>
                <span className="md:hidden">swipe on the board</span>
              </p>
              <p id="stack2048-status" role="status" aria-live="polite" className="sr-only">
                {announce} Highest tile: {LADDER[level]?.name}. {live.length} tiles on the board.
              </p>
            </div>

            {/* The ladder: what you've unlocked, and a teaser of what's next */}
            <div className="rounded-3xl border p-6 md:p-8" style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.02)" }}>
              <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
                Your stack
              </p>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                {top >= WIN_LEVEL
                  ? "You've shipped. Now chase the high score."
                  : `${Math.max(top, 1)}/${WIN_LEVEL} unlocked — merge two ${LADDER[Math.max(top, 1)].name} tiles to find out what's next.`}
              </p>
              <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {LADDER.slice(1).map((step, i) => {
                  const lvl = i + 1
                  const unlocked = lvl <= Math.max(top, level)
                  const isNext = lvl === Math.max(top, level) + 1
                  const s = STYLE[lvl]
                  return (
                    <li
                      key={step.name}
                      className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 font-mono text-xs transition-colors"
                      style={{
                        borderColor: isNext ? "rgba(212,255,63,0.4)" : "var(--line)",
                        borderStyle: isNext ? "dashed" : "solid",
                        color: unlocked ? "var(--fg)" : "var(--muted)",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 rounded"
                        style={{ background: unlocked ? s.bg : "rgba(255,255,255,0.04)", boxShadow: unlocked ? s.glow : undefined }}
                      />
                      <span className="truncate">{unlocked ? step.name : isNext ? "next: ???" : "???"}</span>
                      <span className="ml-auto opacity-50">{valueOf(lvl)}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Score({ label, value, gained }) {
  return (
    <div className="relative min-w-[96px] rounded-2xl border px-4 py-2.5" style={{ borderColor: "var(--line)" }}>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>{label}</div>
      <div className="font-display text-2xl" style={{ color: "var(--fg)" }}>{value.toLocaleString()}</div>
      <AnimatePresence>
        {gained && (
          <motion.span
            key={gained.key}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="pointer-events-none absolute right-3 top-2 font-mono text-sm font-bold"
            style={{ color: "var(--accent)" }}
            aria-hidden="true"
          >
            +{gained.points}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
