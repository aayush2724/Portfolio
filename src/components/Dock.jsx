import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { sceneNumber, SECTION_ORDER } from "./SectionHead"
import { SCENE_LABELS } from "../three/stations"
import { openAssistant, closeAssistant, ASSISTANT_STATE_EVENT } from "../lib/assistantEvents"
import { EASE, DUR } from "../context/ease"
import SoundToggle from "./SoundToggle"

/**
 * The desktop dock: one quiet bar at the foot of the screen instead of three
 * floating pills (the shell hint, the scene HUD, the assistant launcher).
 *
 *   ➜ shell ⌘K  │  07 CODING STATS  │  ● Ask AI      (home; sound is in the top bar)
 *   ➜ shell ⌘K  │  ▮▮▮ sound off   │  ● Ask AI      (case study / blog)
 *
 * The scene readout is the section crossing the middle of the screen, named
 * and numbered like its header rail. On the home page the dock arrives once
 * the hero is scrolled away (the hero has its own shell button); on the
 * case-study and blog pages it is there from the start, without a scene.
 * Phones keep the assistant's round launcher and have no shell to hint at.
 */
export function useScene(enabled) {
  const [id, setId] = useState(null)
  useEffect(() => {
    if (!enabled) return undefined
    let raf = 0
    const read = () => {
      raf = 0
      const mid = window.innerHeight / 2
      let current = null
      for (const sid of SECTION_ORDER) {
        const el = document.getElementById(sid)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= mid && r.bottom > mid) current = sid
      }
      setId(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled])
  return id
}

export default function Dock({ onShell, scenes = false }) {
  const scene = useScene(scenes)
  const [assistantOpen, setAssistantOpen] = useState(false)

  useEffect(() => {
    const on = (e) => setAssistantOpen(Boolean(e.detail?.open))
    window.addEventListener(ASSISTANT_STATE_EVENT, on)
    return () => window.removeEventListener(ASSISTANT_STATE_EVENT, on)
  }, [])

  // Home: hidden over the hero. Elsewhere: always shown.
  const shown = !scenes || (scene !== null && scene !== "hero")
  const label = scene && scene !== "hero" ? SCENE_LABELS[scene] || scene : null

  const seg = "flex items-center gap-2 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors"
  const rule = { borderLeft: "1px solid var(--line)" }
  return (
    // Hidden over the hero: out of the tab order and the accessibility tree too.
    <div
      className="pointer-events-none fixed bottom-5 left-1/2 z-40 hidden -translate-x-1/2 md:block"
      aria-hidden={shown ? undefined : true}
      {...(shown ? {} : { inert: "" })}
    >
      <motion.nav
        aria-label="Quick actions"
        initial={false}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: DUR.enter, ease: EASE.ENTER }}
        className="flex items-stretch rounded-full border backdrop-blur-md"
        style={{ borderColor: "var(--line)", background: "rgb(var(--bg-rgb) / 0.78)", pointerEvents: shown ? "auto" : "none" }}
      >
        <button
          type="button"
          onClick={onShell}
          tabIndex={shown ? 0 : -1}
          title="Open the shell (Ctrl+K)"
          className={`${seg} rounded-l-full hover:text-[var(--fg)]`}
          style={{ color: "var(--muted)" }}
        >
          <span style={{ color: "var(--accent)" }}>➜</span>
          shell
          <kbd className="rounded border px-1.5 py-0.5 normal-case tracking-normal" style={{ borderColor: "var(--line)" }}>
            ⌘K
          </kbd>
        </button>

        {label && (
          <span className={`${seg} min-w-[11rem] justify-center`} style={{ ...rule, color: "var(--fg)" }}>
            <span style={{ color: "var(--accent)" }}>{sceneNumber(scene)}</span>
            {label}
          </span>
        )}

        {/* Off the home page the top bar (and its sound switch) is absent. */}
        {!scenes && (
          <span className="flex items-center px-4" style={rule}>
            <SoundToggle labelled />
          </span>
        )}

        <button
          type="button"
          onClick={() => (assistantOpen ? closeAssistant() : openAssistant())}
          tabIndex={shown ? 0 : -1}
          aria-expanded={assistantOpen}
          aria-controls="portfolio-assistant"
          aria-label={assistantOpen ? "Close the portfolio assistant" : "Open the portfolio assistant"}
          className={`${seg} rounded-r-full hover:text-[var(--fg)]`}
          style={{ ...rule, color: assistantOpen ? "var(--fg)" : "var(--muted)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          {assistantOpen ? "Close" : "Ask AI"}
        </button>
      </motion.nav>
    </div>
  )
}
