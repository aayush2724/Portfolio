import { describe, expect, it } from "vitest"
import { HINTS, HINT_COST, HOME, PAR, TARGET, chipsFor, complete, createHunt, nodeAt, pretty, rankFor, readBest, resolvePath, run, writeBest } from "./hunt"

const text = (res) => res.lines.map((l) => l.text).join("\n")

describe("paths", () => {
  it("resolves relative, absolute, home and parent segments", () => {
    expect(resolvePath(HOME, "projects")).toBe(`${HOME}/projects`)
    expect(resolvePath(`${HOME}/projects`, "..")).toBe(HOME)
    expect(resolvePath(HOME, "../../..")).toBe("/")
    expect(resolvePath("/tmp", "~/music/")).toBe(`${HOME}/music`)
    expect(resolvePath("/tmp", "/var/www/./lost+found")).toBe("/var/www/lost+found")
    expect(pretty(HOME)).toBe("~")
    expect(pretty(`${HOME}/hq`)).toBe("~/hq")
    expect(pretty("/etc")).toBe("/etc")
  })

  it("has the target where the config says it is", () => {
    expect(typeof nodeAt(TARGET)).toBe("string")
    expect(nodeAt(`${HOME}/.config/where.cfg`)).toContain("/var/www/lost+found")
    expect(nodeAt("/nope")).toBeNull()
  })
})

describe("commands", () => {
  it("lists, hides dotfiles until -a, and counts moves", () => {
    const s = createHunt()
    const a = run(s, "ls", 1000)
    expect(text(a)).toContain("projects/")
    expect(text(a)).not.toContain(".config")
    expect(s.moves).toBe(1)
    expect(s.startedAt).toBe(1000)
    const b = run(s, "ls -a")
    expect(text(b)).toContain(".config/")
    expect(s.revealed.has(HOME)).toBe(true)
    expect(chipsFor(s).some((c) => c.name === ".secrets" && c.dir)).toBe(true)
  })

  it("cd, cat and errors behave like a shell", () => {
    const s = createHunt()
    run(s, "cd projects")
    expect(s.cwd).toBe(`${HOME}/projects`)
    expect(text(run(s, "cat NOTES.txt"))).toContain("ls -a")
    expect(text(run(s, "cd nowhere"))).toMatch(/no such file/)
    expect(text(run(s, "cat auralis"))).toMatch(/Is a directory/)
    expect(text(run(s, "cat"))).toMatch(/Give me a file/)
    expect(text(run(s, "frobnicate"))).toMatch(/command not found/)
    run(s, "cd")
    expect(s.cwd).toBe(HOME)
  })

  it("find and grep locate the page for people who know Unix", () => {
    const s = createHunt()
    expect(text(run(s, "find / -name this-page.md"))).toBe(TARGET)
    expect(text(run(s, "find / -name '*.md'"))).toContain(TARGET)
    expect(text(run(s, "grep -r lost+found ~"))).toContain("where.cfg")
    expect(text(run(s, "grep nothing README.md"))).toMatch(/no matches/)
    expect(text(run(s, "grep x projects"))).toMatch(/try -r/)
  })

  it("wins on reading the target, once, and stops counting", () => {
    const s = createHunt()
    run(s, "find / -name this-page.md", 10)
    const res = run(s, "cat /var/www/lost+found/this-page.md", 5000)
    expect(res.won).toBe(true)
    expect(res.lines.every((l) => l.kind === "win")).toBe(true)
    expect(s.won).toBe(true)
    expect(s.finishedAt).toBe(5000)
    expect(s.moves).toBe(2)
    run(s, "ls")
    expect(s.moves).toBe(2)
    expect(rankFor(s.moves)).toBe("sysadmin")
  })

  it("the clue trail reaches the page within developer par", () => {
    const s = createHunt()
    const trail = ["cat README.md", "cat projects/NOTES.txt", "ls -a", "cat .config/where.cfg", "cd /var/www/lost+found", "cat this-page.md"]
    let res
    for (const cmd of trail) res = run(s, cmd)
    expect(res.won).toBe(true)
    expect(s.moves).toBeLessThanOrEqual(PAR.developer)
    expect(rankFor(s.moves)).toBe("developer")
    expect(rankFor(PAR.developer + 1)).toBe("tourist")
  })

  it("hints are progressive and cost moves; help, clear and easter eggs are free", () => {
    const s = createHunt()
    expect(text(run(s, "hint"))).toContain(HINTS[0])
    expect(text(run(s, "hint"))).toContain(HINTS[1])
    expect(s.moves).toBe(2 * HINT_COST)
    for (let i = 0; i < 5; i++) run(s, "hint")
    expect(text(run(s, "hint"))).toContain(HINTS[HINTS.length - 1])
    const before = s.moves
    expect(text(run(s, "help"))).toContain("find")
    expect(run(s, "clear").clear).toBe(true)
    expect(text(run(s, "sudo rm -rf /"))).toMatch(/sudoers/)
    expect(text(run(s, "rm README.md"))).toMatch(/no/i)
    expect(text(run(s, "vim README.md"))).toMatch(/cat/)
    expect(text(run(s, "whoami"))).toBe("lost")
    expect(s.moves).toBe(before)
  })

  it("tree shows two levels without hidden files", () => {
    const s = createHunt()
    const t = text(run(s, "tree"))
    expect(t).toContain("projects/")
    expect(t).toContain("auralis/")
    expect(t).not.toContain(".config")
  })
})

describe("completion", () => {
  it("completes commands, entries and nested paths", () => {
    const s = createHunt()
    expect(complete(s, "ca")).toEqual(["cat"])
    expect(complete(s, "cd pro")).toEqual(["projects/"])
    expect(complete(s, "cat projects/N")).toEqual(["projects/NOTES.txt"])
    expect(complete(s, "cat .c")).toEqual([".config/"])
    expect(complete(s, "cat zzz")).toEqual([])
  })
})

describe("persistence", () => {
  it("round-trips and tolerates a throwing storage", () => {
    const mem = new Map()
    const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) }
    expect(readBest(storage)).toBe(0)
    writeBest(storage, 6)
    expect(readBest(storage)).toBe(6)
    const broken = { getItem: () => { throw new Error("x") }, setItem: () => { throw new Error("x") } }
    expect(readBest(broken)).toBe(0)
    expect(() => writeBest(broken, 1)).not.toThrow()
  })
})
