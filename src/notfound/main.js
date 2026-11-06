/**
 * 404 Hunt — page wiring for 404.html.
 *
 * The page says `cat this-page.md: No such file or directory`, so the game
 * is a terminal treasure hunt: a fake filesystem of the portfolio, real
 * shell commands, a clue trail, and the hidden page as the prize. Bundled by
 * Vite as a module because vercel.json's CSP forbids inline scripts; the
 * shell itself is src/lib/hunt.js. With scripts off the panel stays hidden
 * and the page is the plain 404 it was before.
 */
import { HOME, PAR, chipsFor, complete, createHunt, pretty, rankFor, readBest, run, writeBest } from "../lib/hunt"

const $ = (id) => document.getElementById(id)
const panel = $("nf-game")
const form = $("nf-form")
const input = $("nf-input")

if (panel && form && input) init()

function init() {
  const log = $("nf-log")
  const prompt = $("nf-prompt")
  const cwdEl = $("nf-cwd")
  const movesEl = $("nf-moves")
  const timeEl = $("nf-time")
  const bestEl = $("nf-best")
  const chips = $("nf-chips")
  const unlockEl = $("nf-unlock")
  const cta = $("nf-cta")

  let storage = null
  try {
    storage = window.localStorage
  } catch {
    /* no persistence */
  }
  let best = storage ? readBest(storage) : 0
  let timer = 0
  let historyIdx = -1
  let state = createHunt()
  const touch = matchMedia("(pointer: coarse)").matches
  // Dev-only handle for scripted play-testing; stripped from production builds.
  if (import.meta.env.DEV) window.__nfHunt = () => state

  const LINE_CLASS = {
    cmd: "text-fg",
    out: "text-muted",
    err: "text-ember",
    muted: "text-muted/60 italic",
    win: "text-accent",
  }

  panel.classList.remove("hidden")
  bestEl.textContent = best ? `${best} moves` : "—"
  if (best > 0) cta.textContent = "Take the shortcut home →"

  /* ── log ────────────────────────────────────────────────────────────── */
  function print(kind, text) {
    const line = document.createElement("div")
    line.className = `whitespace-pre-wrap break-words ${LINE_CLASS[kind] || LINE_CLASS.out}`
    if (kind === "cmd") {
      const p = document.createElement("span")
      p.className = "text-accent"
      p.textContent = "$ "
      const c = document.createElement("span")
      c.className = "text-muted"
      c.textContent = `${pretty(state.cwd)} `
      line.append(p, c, document.createTextNode(text))
    } else {
      line.textContent = text || " "
    }
    log.appendChild(line)
    log.scrollTop = log.scrollHeight
  }

  function readouts() {
    const where = pretty(state.cwd)
    prompt.textContent = where
    cwdEl.textContent = where
    movesEl.textContent = String(state.moves)
  }

  function tick() {
    if (state.startedAt === null) return
    const end = state.finishedAt ?? Date.now()
    const s = Math.floor((end - state.startedAt) / 1000)
    timeEl.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
  }

  /* ── touch chips: tap a directory to cd, a file to cat ─────────────── */
  function renderChips() {
    const fixed = [
      { label: "help", cmd: "help" },
      { label: "ls -a", cmd: "ls -a" },
      { label: "..", cmd: "cd .." },
      { label: "hint", cmd: "hint" },
    ]
    const entries = chipsFor(state).slice(0, 8).map((e) => ({ label: e.dir ? `${e.name}/` : e.name, cmd: `${e.dir ? "cd" : "cat"} ${e.name}` }))
    chips.replaceChildren(
      ...[...fixed, ...entries].map((c) => {
        const b = document.createElement("button")
        b.type = "button"
        b.className = "rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
        b.textContent = c.label
        // A chip tap must not pop the soft keyboard: refocus the input only on desktop.
        b.addEventListener("click", () => submit(c.cmd, !touch))
        return b
      })
    )
  }

  /* ── running commands ───────────────────────────────────────────────── */
  function submit(line, refocus = true) {
    const text = line.trim()
    if (!text) return
    print("cmd", text)
    const res = run(state, text, Date.now())
    if (res.clear) log.replaceChildren()
    for (const l of res.lines) print(l.kind, l.text)
    if (res.won) win()
    readouts()
    renderChips()
    tick()
    historyIdx = -1
    input.value = ""
    if (state.startedAt !== null && !timer && !state.won) timer = setInterval(tick, 1000)
    if (refocus) input.focus({ preventScroll: true })
  }

  function win() {
    clearInterval(timer)
    timer = 0
    tick()
    const rank = rankFor(state.moves)
    const line =
      rank === "sysadmin"
        ? `Rank: sysadmin — ${state.moves} moves. You've done this before.`
        : rank === "developer"
          ? `Rank: developer — ${state.moves} moves, par is ${PAR.developer}.`
          : `Rank: tourist — ${state.moves} moves. Found it anyway, which is what counts.`
    print("win", "")
    print("win", line)
    if (!best || state.moves < best) {
      best = state.moves
      if (storage) writeBest(storage, best)
      bestEl.textContent = `${best} moves`
      print("muted", "new personal best")
    }
    print("muted", "type `again` to reset, or take the shortcut home above")
    unlockEl.textContent = "Page located. It still doesn't exist, but now that's official."
    unlockEl.classList.remove("hidden")
    cta.textContent = "Take the shortcut home →"
    cta.classList.add("nf-pulse")
  }

  function reset() {
    clearInterval(timer)
    timer = 0
    state = createHunt()
    log.replaceChildren()
    intro()
    timeEl.textContent = "00:00"
    unlockEl.classList.add("hidden")
    readouts()
    renderChips()
  }

  function intro() {
    print("muted", "Fine. It's somewhere on this box.")
    print("muted", "Find this-page.md, read it, and I'll let you go home.")
    print("muted", `You're in ${pretty(HOME)}. Type help if you're new to shells.`)
  }

  /* ── input ──────────────────────────────────────────────────────────── */
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const text = input.value.trim()
    if (text === "again" || text === "reset") {
      input.value = ""
      reset()
      return
    }
    submit(text)
  })

  input.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const matches = complete(state, input.value)
      if (matches.length === 1) {
        const parts = input.value.split(/\s+/)
        parts[parts.length - 1] = matches[0]
        input.value = parts.join(" ") + (matches[0].endsWith("/") ? "" : " ")
      } else if (matches.length > 1) {
        print("muted", matches.join("  "))
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const h = state.history
      if (!h.length) return
      e.preventDefault()
      if (historyIdx === -1) historyIdx = h.length
      historyIdx = Math.min(h.length, Math.max(0, historyIdx + (e.key === "ArrowUp" ? -1 : 1)))
      input.value = h[historyIdx] ?? ""
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      log.replaceChildren()
    }
  })

  // Clicking anywhere in the terminal focuses the input, like a real one (desktop only;
  // on a phone a tap to read the log must not raise the keyboard).
  if (!touch) log.addEventListener("click", () => input.focus({ preventScroll: true }))

  intro()
  readouts()
  renderChips()
}
