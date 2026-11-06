/**
 * 404 Hunt — a terminal treasure hunt for the 404 page. No DOM in here.
 *
 * The page's own gag is `cat this-page.md` → "No such file or directory", so
 * the game is: it's somewhere on this box, go find it. A small fake
 * filesystem of the portfolio, a handful of real shell commands, a clue
 * trail for people who read files, and `find` for people who know Unix.
 *
 * Scoring is moves (commands that touch the filesystem) against par; hints
 * cost moves. `run` is pure: it returns the lines to print and mutates the
 * state it was given.
 */

export const HOME = "/home/aayush"
export const TARGET = "/var/www/lost+found/this-page.md"
export const PAR = { sysadmin: 4, developer: 9 }
export const HINT_COST = 2
export const BEST_KEY = "hunt.best"

const PAGE = `# this-page.md

Found it. The page didn't exist, but you clearly do.

Everything else lives on the home page: the projects, the stats,
the case studies and how to reach me. Take the shortcut above.`

// A string is a file; an object is a directory.
export const FS = {
  home: {
    aayush: {
      "README.md": `# Aayush's home

If you're reading this, you're looking for this-page.md.
It isn't here any more. I left a note in projects/ when I moved it.`,
      projects: {
        "NOTES.txt": `Moved this-page.md out of projects/ on deploy day.
Where to? I wrote it down in my config.
Hidden files are hidden for a reason. (ls -a)`,
        auralis: { "README.md": "Auralis — AI sales-objection engine (LangGraph, FastAPI, RAG).\nThe full README opens from the projects section on the home page." },
        deskguard: { "README.md": "DeskGuard — seat booking with a security slant.\nFull README on the home page, projects section." },
        mindflow: { "README.md": "MindFlow — AI study companion.\nFull README on the home page, projects section." },
      },
      ".config": {
        "where.cfg": `[pages]
this-page = /var/www/lost+found
# TODO: move it back before anyone notices`,
      },
      ".secrets": {
        ".env": `LASTFM_API_KEY=nice_try
# OWASP chapter president. I rotate these.`,
      },
      music: {
        "riffs.txt": `andalusian.tab
four-chords.tab
pentatonic.tab
# play them: home page → Pluck It`,
      },
      hq: {
        "map.txt": `desk  → projects
shelf → stack
amp   → music
# the 3D room on the home page`,
      },
    },
  },
  var: {
    www: {
      "lost+found": { "this-page.md": PAGE },
      html: { "index.html": "<!-- the real site is the home page; this is just the 404 -->" },
    },
  },
  etc: {
    motd: `Welcome to aayush.portfolio. 404 of 404 pages are missing today.
Tip: find / -name this-page.md — if you know how.`,
    hosts: "127.0.0.1  localhost\n0.0.0.0    this-page.md   # see? not here",
  },
  tmp: {},
}

export const HINTS = [
  "Start with ls. Files worth reading end in .md or .txt — cat them.",
  "Some files hide. ls -a shows them. There's a note in projects/ too.",
  "Config files say where things live. Read the one in ~/.config.",
  "It's in /var/www/lost+found. cd there and cat it.",
]

export const COMMANDS = ["ls", "cd", "cat", "pwd", "find", "grep", "tree", "help", "hint", "clear", "whoami", "echo"]

/* ── paths ──────────────────────────────────────────────────────────────── */

export function resolvePath(cwd, input = "") {
  let p = input.trim()
  if (!p) return cwd
  if (p === "~" || p.startsWith("~/")) p = HOME + p.slice(1)
  const parts = (p.startsWith("/") ? [] : cwd.split("/").filter(Boolean))
  for (const seg of p.split("/")) {
    if (!seg || seg === ".") continue
    if (seg === "..") parts.pop()
    else parts.push(seg)
  }
  return "/" + parts.join("/")
}

export function nodeAt(path) {
  let node = FS
  for (const seg of path.split("/").filter(Boolean)) {
    if (!node || typeof node !== "object" || !(seg in node)) return null
    node = node[seg]
  }
  return node === undefined ? null : node
}

export const isDir = (node) => node !== null && typeof node === "object"

/** "~" for home paths, so the prompt stays short. */
export function pretty(path) {
  if (path === HOME) return "~"
  if (path.startsWith(HOME + "/")) return "~" + path.slice(HOME.length)
  return path
}

function entries(node, all) {
  return Object.keys(node)
    .filter((k) => all || !k.startsWith("."))
    .sort((a, b) => a.localeCompare(b))
}

function globToRegExp(glob) {
  return new RegExp("^" + glob.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$", "i")
}

/* ── state ──────────────────────────────────────────────────────────────── */

export function createHunt() {
  return {
    cwd: HOME,
    moves: 0,
    hints: 0,
    startedAt: null,
    finishedAt: null,
    won: false,
    revealed: new Set(), // directories where `ls -a` has been run (for touch chips)
    history: [],
  }
}

export function rankFor(moves) {
  if (moves <= PAR.sysadmin) return "sysadmin"
  if (moves <= PAR.developer) return "developer"
  return "tourist"
}

/** Tappable entries for the current directory: dirs end with "/", hidden ones only once revealed. */
export function chipsFor(state) {
  const node = nodeAt(state.cwd)
  if (!isDir(node)) return []
  const all = state.revealed.has(state.cwd)
  return entries(node, all).map((name) => ({ name, dir: isDir(node[name]) }))
}

/** Tab completion for the last token: command names at position 0, cwd entries after. */
export function complete(state, line) {
  const parts = line.split(/\s+/)
  const last = parts[parts.length - 1] ?? ""
  if (parts.length === 1) return COMMANDS.filter((c) => c.startsWith(last))
  const slash = last.lastIndexOf("/")
  const dirPart = slash >= 0 ? last.slice(0, slash + 1) : ""
  const stem = slash >= 0 ? last.slice(slash + 1) : last
  const node = nodeAt(resolvePath(state.cwd, dirPart || "."))
  if (!isDir(node)) return []
  return entries(node, stem.startsWith("."))
    .filter((n) => n.startsWith(stem))
    .map((n) => dirPart + n + (isDir(node[n]) ? "/" : ""))
}

/* ── commands ───────────────────────────────────────────────────────────── */

const out = (text) => ({ kind: "out", text })
const err = (text) => ({ kind: "err", text })
const muted = (text) => ({ kind: "muted", text })

function findIn(path, node, re, acc, all) {
  for (const name of entries(node, all)) {
    const child = node[name]
    const childPath = path === "/" ? "/" + name : path + "/" + name
    if (re.test(name)) acc.push(childPath)
    if (isDir(child)) findIn(childPath, child, re, acc, all)
  }
}

function grepIn(path, node, needle, acc, recursive) {
  for (const name of Object.keys(node)) {
    const child = node[name]
    const childPath = path === "/" ? "/" + name : path + "/" + name
    if (isDir(child)) {
      if (recursive) grepIn(childPath, child, needle, acc, true)
    } else {
      for (const line of child.split("\n")) if (line.toLowerCase().includes(needle)) acc.push(`${childPath}: ${line}`)
    }
  }
}

function treeLines(node, prefix, depth, acc) {
  const names = entries(node, false)
  names.forEach((name, i) => {
    const last = i === names.length - 1
    const child = node[name]
    acc.push(`${prefix}${last ? "└── " : "├── "}${name}${isDir(child) ? "/" : ""}`)
    if (isDir(child) && depth > 1) treeLines(child, prefix + (last ? "    " : "│   "), depth - 1, acc)
  })
}

/**
 * Run one command line. Returns { lines, clear, won }.
 * `now` is a ms clock; the timer starts on the first command.
 */
export function run(state, line, now = Date.now()) {
  const raw = line.trim()
  const lines = []
  if (!raw) return { lines, clear: false, won: false }
  state.history.push(raw)
  if (state.startedAt === null) state.startedAt = now

  const [cmd, ...args] = raw.split(/\s+/)
  const flags = args.filter((a) => a.startsWith("-"))
  const rest = args.filter((a) => !a.startsWith("-"))
  const countMove = () => {
    if (!state.won) state.moves++
  }

  switch (cmd) {
    case "help":
      lines.push(
        out("ls [-a] [dir]     list files (-a shows hidden ones)"),
        out("cd <dir>          change directory (.. goes up, ~ is home)"),
        out("cat <file>        read a file"),
        out("find <dir> -name <pattern>   search by name, * works"),
        out("grep [-r] <word> <file|dir>  search inside files"),
        out("tree              the current directory, two levels deep"),
        out("pwd · clear · hint (costs 2 moves)"),
        muted("Tab completes names. Finding this-page.md and reading it wins.")
      )
      return { lines, clear: false, won: false }

    case "clear":
      return { lines, clear: true, won: false }

    case "hint": {
      const h = HINTS[Math.min(state.hints, HINTS.length - 1)]
      state.hints++
      if (!state.won) state.moves += HINT_COST
      lines.push(muted(`hint ${Math.min(state.hints, HINTS.length)}/${HINTS.length}: ${h}`))
      return { lines, clear: false, won: false }
    }

    case "pwd":
      lines.push(out(state.cwd))
      return { lines, clear: false, won: false }

    case "whoami":
      lines.push(out("lost"))
      return { lines, clear: false, won: false }

    case "echo":
      lines.push(out(rest.join(" ")))
      return { lines, clear: false, won: false }

    case "sudo":
      lines.push(err("aayush is not in the sudoers file. This incident will be reported."))
      return { lines, clear: false, won: false }

    case "rm":
      lines.push(err("rm: no. Not on my box."))
      return { lines, clear: false, won: false }

    case "vim":
    case "vi":
    case "nano":
    case "emacs":
      lines.push(err(`${cmd}: you'd never get out. Use cat.`))
      return { lines, clear: false, won: false }

    case "ls": {
      const all = flags.includes("-a") || flags.includes("-la") || flags.includes("-al")
      const path = resolvePath(state.cwd, rest[0] || ".")
      const node = nodeAt(path)
      countMove()
      if (node === null) {
        lines.push(err(`ls: cannot access '${rest[0]}': No such file or directory`))
      } else if (!isDir(node)) {
        lines.push(out(rest[0]))
      } else {
        if (all) state.revealed.add(path)
        const names = entries(node, all).map((n) => (isDir(node[n]) ? n + "/" : n))
        lines.push(out(names.length ? names.join("  ") : "(empty)"))
      }
      return { lines, clear: false, won: false }
    }

    case "cd": {
      const path = resolvePath(state.cwd, rest[0] || "~")
      const node = nodeAt(path)
      countMove()
      if (node === null) lines.push(err(`cd: no such file or directory: ${rest[0]}`))
      else if (!isDir(node)) lines.push(err(`cd: not a directory: ${rest[0]}`))
      else state.cwd = path
      return { lines, clear: false, won: false }
    }

    case "cat": {
      if (!rest[0]) {
        lines.push(err("cat: what? Give me a file."))
        return { lines, clear: false, won: false }
      }
      const path = resolvePath(state.cwd, rest[0])
      const node = nodeAt(path)
      countMove()
      if (node === null) lines.push(err(`cat: ${rest[0]}: No such file or directory`))
      else if (isDir(node)) lines.push(err(`cat: ${rest[0]}: Is a directory`))
      else {
        const won = path === TARGET
        for (const l of node.split("\n")) lines.push(won ? { kind: "win", text: l } : out(l))
        if (won && !state.won) {
          state.won = true
          state.finishedAt = now
        }
        return { lines, clear: false, won }
      }
      return { lines, clear: false, won: false }
    }

    case "find": {
      const nameIdx = args.indexOf("-name")
      const pattern = nameIdx >= 0 ? args[nameIdx + 1] : null
      const start = resolvePath(state.cwd, nameIdx === 0 ? "." : rest[0] || ".")
      const node = nodeAt(start)
      countMove()
      if (!pattern) lines.push(err("find: usage: find <dir> -name <pattern>"))
      else if (!isDir(node)) lines.push(err(`find: '${rest[0]}': No such file or directory`))
      else {
        const acc = []
        findIn(start === "/" ? "/" : start, node, globToRegExp(pattern.replace(/^['"]|['"]$/g, "")), acc, true)
        lines.push(...(acc.length ? acc.map(out) : [muted("(nothing)")]))
      }
      return { lines, clear: false, won: false }
    }

    case "grep": {
      const recursive = flags.includes("-r") || flags.includes("-ri") || flags.includes("-ir")
      const [needle, where] = rest
      countMove()
      if (!needle) {
        lines.push(err("grep: usage: grep [-r] <word> <file|dir>"))
        return { lines, clear: false, won: false }
      }
      const path = resolvePath(state.cwd, where || ".")
      const node = nodeAt(path)
      if (node === null) lines.push(err(`grep: ${where}: No such file or directory`))
      else if (isDir(node) && !recursive) lines.push(err(`grep: ${where || "."}: Is a directory (try -r)`))
      else {
        const acc = []
        if (isDir(node)) grepIn(path, node, needle.toLowerCase(), acc, true)
        else for (const l of node.split("\n")) if (l.toLowerCase().includes(needle.toLowerCase())) acc.push(l)
        lines.push(...(acc.length ? acc.map(out) : [muted("(no matches)")]))
      }
      return { lines, clear: false, won: false }
    }

    case "tree": {
      const node = nodeAt(state.cwd)
      countMove()
      const acc = [pretty(state.cwd)]
      treeLines(node, "", 2, acc)
      lines.push(...acc.map(out))
      return { lines, clear: false, won: false }
    }

    default:
      lines.push(err(`${cmd}: command not found. Try help.`))
      return { lines, clear: false, won: false }
  }
}

/* ── persistence ────────────────────────────────────────────────────────── */
export function readBest(storage) {
  try {
    return Number(storage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}
export function writeBest(storage, moves) {
  try {
    storage.setItem(BEST_KEY, String(moves))
  } catch {
    /* best just won't persist */
  }
}
