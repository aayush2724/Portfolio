import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { caseStudies } from "../data/caseStudies"
import portfolioData from "../data/portfolioData.json"
import { EASE, DUR } from "../context/ease"

/**
 * The shell — the site's signature interface.
 *
 * Replaces CommandPalette (and consolidates what Terminal.jsx and PortfolioBot
 * were each half-doing): one persistent, *real* terminal that navigates the
 * whole portfolio. `ls projects/` lists them, `open auralis` opens the case
 * study, `cat about.md` scrolls to About, `sudo hire-me` does what it says.
 *
 * Opens with ⌘K / Ctrl+K or the terminal button; mouse users never need it,
 * keyboard users never need anything else.
 */

const SECTIONS = [
  { id: "hero", file: "home" },
  { id: "projects", file: "projects" },
  { id: "about", file: "about.md" },
  { id: "skills", file: "skills.txt" },
  { id: "stats", file: "stats" },
  { id: "journey", file: "journey.log" },
  { id: "testimonials", file: "testimonials" },
  { id: "contact", file: "contact" },
]

const SOCIALS = {
  github: "https://github.com/aayush2724",
  linkedin: "https://linkedin.com/in/aayush2724",
  leetcode: "https://leetcode.com/aayush2724",
  resume: "/resume.pdf",
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth" })
  return !!el
}

function findSection(arg) {
  const clean = arg.replace(/[/~]/g, "").replace(/\.(md|txt|log)$/, "")
  return SECTIONS.find((s) => s.id === clean || s.file.startsWith(clean))
}

function findCaseStudy(arg) {
  const clean = arg.toLowerCase().replace(/[/~]/g, "")
  return caseStudies.find(
    (c) => c.id === clean || c.name.toLowerCase() === clean
  )
}

/** Command implementations. Each returns output lines (strings) or null. */
function makeCommands({ close }) {
  const projectList = () => caseStudies.map((cs) => cs.id).join("  ")

  const goTo = (arg) => {
    if (!arg) return ["cd: usage: cd <section>  (try: cd projects)"]
    const section = findSection(arg)
    if (section) {
      close()
      scrollToSection(section.id)
      return null
    }
    // `cd <project>` opens its case study — people will try it, so it works.
    const cs = findCaseStudy(arg)
    if (cs) {
      close()
      window.location.hash = `#/work/${cs.id}`
      return null
    }
    return [
      `cd: no such section: ${arg}`,
      "→ try: " + SECTIONS.map((s) => s.id).join(", "),
    ]
  }

  return {
    help: () => [
      "Available commands:",
      "",
      "  ls [projects/]     list sections or projects",
      "  cd <section>       jump to a section (try: cd projects)",
      "  cat <file>         same as cd — cat about.md, cat skills.txt",
      "  open <project>     open a case study (try: open " + caseStudies[0].id + ")",
      "  whoami             who is this guy",
      "  stats              live LeetCode / GitHub numbers",
      "  socials            github · linkedin · leetcode · resume",
      "  sudo hire-me       the important one",
      "  history            your commands this session",
      "  clear              clear the screen",
      "  exit               close the shell (or press Esc)",
    ],
    ls: (arg) => {
      if (arg && arg.replace(/\/$/, "") === "projects") {
        return [projectList()]
      }
      return [
        SECTIONS.map((s) => s.file).join("  "),
        "",
        "→ ls projects/ for the project list",
      ]
    },
    cd: goTo,
    cat: goTo,
    open: (arg) => {
      if (!arg) return ["open: usage: open <project>", "→ " + projectList()]
      const cs = findCaseStudy(arg)
      if (cs) {
        close()
        window.location.hash = `#/work/${cs.id}`
        return null
      }
      return [`open: no case study named "${arg}"`, "→ " + projectList()]
    },
    whoami: () => [
      "Aayush Kumar",
      "CS student · full-stack developer · OWASP chapter president, NIE Mysore",
      `${portfolioData.leetcode?.stats?.totalSolved || "700+"} DSA problems · ${portfolioData.github?.length || 12}+ projects shipped · 3× hackathon finalist`,
    ],
    stats: () => {
      const lc = portfolioData.leetcode?.stats
      return [
        `leetcode   ${lc?.totalSolved ?? "—"} solved  (E:${lc?.easySolved ?? "—"} M:${lc?.mediumSolved ?? "—"} H:${lc?.hardSolved ?? "—"})`,
        `github     ${portfolioData.github?.length ?? "—"} public repos`,
        "→ cd stats for the full dashboard",
      ]
    },
    socials: () => [
      Object.keys(SOCIALS).join("  ·  "),
      "→ open with: socials <name>   e.g. socials github",
    ],
    sudo: (arg) => {
      if (/^hire-?me$/.test(arg || "")) {
        close()
        scrollToSection("contact")
        return null
      }
      return [`sudo: ${arg || ""}: permission denied (nice try)`]
    },
    exit: () => {
      close()
      return null
    },
  }
}

export default function Shell({ isOpen, onClose }) {
  const [lines, setLines] = useState(() => [
    { type: "out", text: "aayush-portfolio shell — type `help` to start" },
  ])
  const [input, setInput] = useState("")
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef(null)
  const bodyRef = useRef(null)

  const commands = useMemo(() => makeCommands({ close: onClose }), [onClose])

  // Focus on open, refocus on any click inside the window.
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Pin scroll to the latest output.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [isOpen, onClose])

  // Same Lenis pause as the case-study modal: wheel over the shell must scroll
  // its scrollback, not the page behind it.
  useEffect(() => {
    if (isOpen) window.__lenis?.stop()
    else window.__lenis?.start()
    return () => window.__lenis?.start()
  }, [isOpen])

  const run = (raw) => {
    const text = raw.trim()
    if (!text) return
    setHistory((h) => [...h, text])
    setHistIdx(-1)

    const echo = { type: "cmd", text }
    const [name, ...rest] = text.split(/\s+/)
    const arg = rest.join(" ")

    let out
    if (name === "clear") {
      setLines([])
      return
    }
    if (name === "history") {
      out = history.length ? history.map((h, i) => `  ${i + 1}  ${h}`) : ["(empty)"]
    } else if (name === "socials" && arg && SOCIALS[arg.toLowerCase()]) {
      window.open(SOCIALS[arg.toLowerCase()], "_blank", "noopener,noreferrer")
      out = [`opening ${arg}…`]
    } else if (commands[name]) {
      out = commands[name](arg)
    } else {
      out = [`${name}: command not found — try \`help\``]
    }

    setLines((l) => [
      ...l,
      echo,
      ...(out ? out.map((t) => ({ type: "out", text: t })) : []),
    ])
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      run(input)
      setInput("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (!history.length) return
      const next = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(next)
      setInput(history[next])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (histIdx < 0) return
      const next = histIdx + 1
      if (next >= history.length) {
        setHistIdx(-1)
        setInput("")
      } else {
        setHistIdx(next)
        setInput(history[next])
      }
    } else if (e.key === "Tab") {
      // Tab-complete commands and project ids — small touch, sells the illusion.
      e.preventDefault()
      const parts = input.split(/\s+/)
      const last = parts[parts.length - 1].toLowerCase()
      if (!last) return
      const pool =
        parts.length === 1
          ? [...Object.keys(commands), "history", "clear"]
          : [...caseStudies.map((c) => c.id), ...SECTIONS.map((s) => s.id)]
      const hit = pool.find((p) => p.startsWith(last))
      if (hit) {
        parts[parts.length - 1] = hit
        setInput(parts.join(" "))
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.sharp }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/70"
          />
          <div className="pointer-events-none fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.99,
                transition: { duration: DUR.exit, ease: EASE.EXIT },
              }}
              transition={{ duration: DUR.enter, ease: EASE.ENTER }}
              className="pointer-events-auto flex h-[min(480px,70vh)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] font-mono text-sm shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
              onClick={() => inputRef.current?.focus()}
            >
              {/* Title bar */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white/[0.02] px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                    <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-xs text-[var(--muted)]">aayush@portfolio — zsh</span>
                </div>
                <span className="text-[10px] text-[var(--muted)]">esc to close</span>
              </div>

              {/* Scrollback */}
              <div ref={bodyRef} data-lenis-prevent className="flex-grow overflow-y-auto p-4 leading-relaxed">
                {lines.map((l, i) =>
                  l.type === "cmd" ? (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <span className="text-[var(--accent)]">➜</span>
                      <span className="text-[var(--muted)]">~</span>
                      <span className="text-[var(--fg)]">{l.text}</span>
                    </div>
                  ) : (
                    <pre key={i} className="whitespace-pre-wrap font-mono text-[var(--muted)]">
                      {l.text}
                    </pre>
                  )
                )}
              </div>

              {/* Prompt */}
              <div className="flex flex-shrink-0 items-center gap-2 border-t border-[var(--line)] px-4 py-3">
                <span className="text-[var(--accent)]">➜</span>
                <span className="text-[var(--muted)]">~</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoCapitalize="none"
                  autoComplete="off"
                  aria-label="Shell command input"
                  placeholder="help"
                  className="min-w-0 flex-grow bg-transparent text-[var(--fg)] caret-[var(--accent)] outline-none placeholder:text-[var(--muted)]/40"
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
