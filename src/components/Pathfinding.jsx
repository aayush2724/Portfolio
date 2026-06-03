import { useEffect, useState } from "react"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { usePrefersReducedMotion } from "../context/motion"

const ROWS = 11
const COLS = 27
const key = (r, c) => `${r},${c}`

function buildScenario() {
  const start = { r: (ROWS / 2) | 0, c: 1 }
  const end = { r: (ROWS / 2) | 0, c: COLS - 2 }
  const walls = new Set()
  const target = ROWS * COLS * 0.22
  for (let i = 0; i < target; i++) {
    const r = (Math.random() * ROWS) | 0
    const c = (Math.random() * COLS) | 0
    if ((r === start.r && c === start.c) || (r === end.r && c === end.c)) continue
    walls.add(key(r, c))
  }
  return { start, end, walls }
}

function bfs({ start, end, walls }) {
  const q = [start]
  const seen = new Set([key(start.r, start.c)])
  const prev = new Map()
  const order = []
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  while (q.length) {
    const cur = q.shift()
    order.push(cur)
    if (cur.r === end.r && cur.c === end.c) break
    for (const [dr, dc] of dirs) {
      const nr = cur.r + dr, nc = cur.c + dc
      if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) continue
      const k = key(nr, nc)
      if (seen.has(k) || walls.has(k)) continue
      seen.add(k)
      prev.set(k, key(cur.r, cur.c))
      q.push({ r: nr, c: nc })
    }
  }
  const path = []
  let k = key(end.r, end.c)
  if (seen.has(k)) {
    while (k) {
      const [r, c] = k.split(",").map(Number)
      path.unshift({ r, c })
      k = prev.get(k)
    }
  }
  return { order, path }
}

export default function Pathfinding() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: "-40px" })
  const reduced = usePrefersReducedMotion()

  const [scn, setScn] = useState(null)
  const [order, setOrder] = useState([])
  const [path, setPath] = useState([])
  const [nVis, setNVis] = useState(0)
  const [nPath, setNPath] = useState(0)

  useEffect(() => {
    if (!inView || reduced) return
    let cancelled = false
    let timer

    const run = () => {
      let s, res
      do {
        s = buildScenario()
        res = bfs(s)
      } while (res.path.length === 0) // guarantee a solvable maze
      setScn(s)
      setOrder(res.order)
      setPath(res.path)
      setNVis(0)
      setNPath(0)

      let v = 0
      const visit = () => {
        if (cancelled) return
        v++
        setNVis(v)
        if (v < res.order.length) timer = setTimeout(visit, 16)
        else {
          let p = 0
          const walk = () => {
            if (cancelled) return
            p++
            setNPath(p)
            if (p < res.path.length) timer = setTimeout(walk, 45)
            else timer = setTimeout(run, 1900) // solved → pause → regenerate
          }
          timer = setTimeout(walk, 250)
        }
      }
      timer = setTimeout(visit, 250)
    }

    run()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [inView, reduced])

  // reduced-motion: show a static solved maze
  useEffect(() => {
    if (!reduced) return
    let s, res
    do { s = buildScenario(); res = bfs(s) } while (res.path.length === 0)
    setScn(s); setOrder(res.order); setPath(res.path)
    setNVis(res.order.length); setNPath(res.path.length)
  }, [reduced])

  const visited = new Set(order.slice(0, nVis).map((c) => key(c.r, c.c)))
  const onPath = new Set(path.slice(0, nPath).map((c) => key(c.r, c.c)))

  const cellClass = (r, c) => {
    const k = key(r, c)
    if (scn && r === scn.start.r && c === scn.start.c) return "bg-emerald-400 shadow-[0_0_10px_#34d399]"
    if (scn && r === scn.end.r && c === scn.end.c) return "bg-fuchsia-400 shadow-[0_0_10px_#e879f9]"
    if (scn?.walls.has(k)) return "bg-white/[0.04]"
    if (onPath.has(k)) return "bg-amber-300 shadow-[0_0_8px_#fcd34d]"
    if (visited.has(k)) return "bg-violet-500/60"
    return "bg-white/[0.02]"
  }

  return (
    <div ref={ref} className="glass p-5 rounded-2xl border border-white/7">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-cyan-400">breadthFirstSearch()</span>
        <span className="font-mono text-xs text-white/40">shortest path · O(V+E)</span>
      </div>

      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const r = (i / COLS) | 0
          const c = i % COLS
          return (
            <div
              key={i}
              className={`aspect-square rounded-[3px] transition-colors duration-200 ${cellClass(r, c)}`}
            />
          )
        })}
      </div>

      <div className="flex flex-wrap gap-4 mt-4 font-mono text-[11px] text-white/50">
        <Legend color="bg-emerald-400" label="start" />
        <Legend color="bg-fuchsia-400" label="goal" />
        <Legend color="bg-violet-500/60" label="explored" />
        <Legend color="bg-amber-300" label="path" />
        <Legend color="bg-white/10" label="wall" />
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-[3px] ${color}`} /> {label}
    </span>
  )
}
