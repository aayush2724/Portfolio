import { describe, expect, it } from "vitest"
import { SIZE, WIN_LEVEL, canMove, maxLevel, move, newBoard, spawn } from "./stack2048"

/** Build tiles from a grid of levels (0 = empty). */
function fromGrid(rows) {
  let id = 0
  const tiles = []
  rows.forEach((row, r) => row.forEach((level, c) => level && tiles.push({ id: ++id, level, r, c })))
  return tiles
}

/** Back to a grid of levels, ignoring tiles absorbed by a merge. */
function toGrid(tiles) {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  for (const t of tiles) if (!t.dying) g[t.r][t.c] = t.level
  return g
}

const counter = () => {
  let n = 100
  return () => ++n
}

describe("move", () => {
  it("slides and merges toward the direction", () => {
    const { tiles, moved, gained } = move(fromGrid([[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), "right")
    expect(toGrid(tiles)[0]).toEqual([0, 0, 0, 2])
    expect(moved).toBe(true)
    expect(gained).toBe(4)
  })

  it("merges each tile at most once per move", () => {
    const { tiles } = move(fromGrid([[1, 1, 1, 1], [2, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), "left")
    expect(toGrid(tiles)[0]).toEqual([2, 2, 0, 0])
    expect(toGrid(tiles)[1]).toEqual([2, 2, 0, 0])
  })

  it("moves columns for up and down", () => {
    const board = fromGrid([[1, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [3, 0, 0, 0]])
    expect(toGrid(move(board, "up").tiles).map((r) => r[0])).toEqual([2, 3, 0, 0])
    expect(toGrid(move(board, "down").tiles).map((r) => r[0])).toEqual([0, 0, 2, 3])
  })

  it("reports no move when nothing can shift", () => {
    const { moved } = move(fromGrid([[1, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), "left")
    expect(moved).toBe(false)
  })

  it("keeps ids so tiles can animate, and marks the absorbed one", () => {
    const board = fromGrid([[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])
    const { tiles } = move(board, "left")
    const survivor = tiles.find((t) => t.merged)
    const absorbed = tiles.find((t) => t.dying)
    expect([survivor.id, absorbed.id].sort()).toEqual([1, 2])
    expect([absorbed.r, absorbed.c]).toEqual([survivor.r, survivor.c])
  })
})

describe("board state", () => {
  it("starts with two tiles and spawns into empty cells only", () => {
    const board = newBoard(counter(), () => 0)
    expect(board).toHaveLength(2)
    expect(new Set(board.map((t) => `${t.r},${t.c}`)).size).toBe(2)
  })

  it("does not spawn on a full board", () => {
    const full = fromGrid([[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]])
    expect(spawn(full, counter())).toBe(full)
  })

  it("detects game over only when no merge is possible", () => {
    expect(canMove(fromGrid([[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]]))).toBe(false)
    expect(canMove(fromGrid([[1, 1, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]]))).toBe(true)
  })

  it("tracks the best tile and ends the ladder at Shipped", () => {
    expect(maxLevel(fromGrid([[3, 0, 0, 0], [0, 7, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]))).toBe(7)
    expect(WIN_LEVEL).toBe(11)
  })
})
