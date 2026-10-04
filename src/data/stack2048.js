/**
 * "Stack 2048" — 2048 where every merge climbs the tech stack.
 *
 * Kept free of React so the rules can be tested. A board is a flat list of
 * tiles { id, level, r, c } on a SIZE×SIZE grid; level 1 is the "2" tile and
 * each merge adds one level, so level 11 is the classic 2048 tile — Shipped.
 *
 * Tiles keep their id while they slide, so the UI can animate them. A merge
 * leaves the absorbed tile in the list flagged `dying` (it slides into its
 * partner, then the UI drops it) and flags the survivor `merged`.
 */

export const SIZE = 4

export const LADDER = [
  null,
  { name: "HTML" },
  { name: "CSS" },
  { name: "JS" },
  { name: "TS" },
  { name: "React" },
  { name: "Node" },
  { name: "Postgres" },
  { name: "Redis" },
  { name: "Docker" },
  { name: "LangChain" },
  { name: "Shipped 🚀" },
]

export const WIN_LEVEL = LADDER.length - 1

/** Points for creating a tile of `level`, as in classic 2048 (its face value). */
export const valueOf = (level) => 2 ** level

const VECTORS = {
  left: { line: (i, k) => [i, k] },
  right: { line: (i, k) => [i, SIZE - 1 - k] },
  up: { line: (i, k) => [k, i] },
  down: { line: (i, k) => [SIZE - 1 - k, i] },
}

export const DIRECTIONS = Object.keys(VECTORS)

/** Slide every live tile toward `dir`, merging equal neighbours once per move. */
export function move(tiles, dir) {
  const { line } = VECTORS[dir]
  const live = tiles.filter((t) => !t.dying).map((t) => ({ ...t, merged: false, isNew: false }))
  const at = new Map(live.map((t) => [`${t.r},${t.c}`, t]))
  const out = []
  let gained = 0
  let moved = false

  for (let i = 0; i < SIZE; i++) {
    const cells = Array.from({ length: SIZE }, (_, k) => line(i, k))
    const inLine = cells.map(([r, c]) => at.get(`${r},${c}`)).filter(Boolean)
    let slot = 0
    let last = null
    for (const tile of inLine) {
      if (last && last.level === tile.level && !last.merged) {
        last.level += 1
        last.merged = true
        gained += valueOf(last.level)
        out.push({ ...tile, r: last.r, c: last.c, dying: true })
        moved = true
        continue
      }
      const [r, c] = cells[slot++]
      if (r !== tile.r || c !== tile.c) moved = true
      tile.r = r
      tile.c = c
      out.push(tile)
      last = tile
    }
  }
  return { tiles: out, moved, gained }
}

/** Drop a new HTML (90%) or CSS (10%) tile on a random empty cell. */
export function spawn(tiles, nextId, rng = Math.random) {
  const taken = new Set(tiles.filter((t) => !t.dying).map((t) => `${t.r},${t.c}`))
  const empty = []
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!taken.has(`${r},${c}`)) empty.push([r, c])
  if (!empty.length) return tiles
  const [r, c] = empty[Math.floor(rng() * empty.length)]
  return [...tiles, { id: nextId(), level: rng() < 0.9 ? 1 : 2, r, c, isNew: true }]
}

export function newBoard(nextId, rng = Math.random) {
  return spawn(spawn([], nextId, rng), nextId, rng)
}

/** True while some move would change the board. */
export function canMove(tiles) {
  const live = tiles.filter((t) => !t.dying)
  if (live.length < SIZE * SIZE) return true
  const at = new Map(live.map((t) => [`${t.r},${t.c}`, t.level]))
  return live.some(({ r, c, level }) => at.get(`${r},${c + 1}`) === level || at.get(`${r + 1},${c}`) === level)
}

export const maxLevel = (tiles) => tiles.reduce((m, t) => (t.dying ? m : Math.max(m, t.level)), 0)
