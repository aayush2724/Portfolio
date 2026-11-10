import { motion } from "framer-motion"
import AnimatedHeading from "./AnimatedHeading"
import Reveal from "./Reveal"
import { usePrefersReducedMotion, useLowPower } from "../context/motion"
import { EASE, DUR } from "../context/ease"
import { STATIONS, DEFAULT_STATION } from "../three/stations"

/**
 * Editorial section header: an index rail, then the title.
 *
 *   04 ── ~/about.md ──────────────────────────── NIE Mysore · India
 *   TITLE IN CAPS with a *serif* accent                    aside copy
 *
 * The number is the section's scene number (the HUD's "Scene 04 / 13"), the
 * path keeps the shell's voice without a pill, and the rule draws itself in
 * once on reveal. Meta hides on phones unless it carries real information
 * (`metaOnPhones`, e.g. Now's last-updated date). Signature sections (Projects, The stack, The approach,
 * Contact) keep their own treatments — one header everywhere would be its
 * own kind of template.
 */

/** Page order of the home sections — matches App.jsx and the HUD's count. */
const ORDER = ["hero", "hq", "projects", "about", "skills", "approach", "stats", "journey", "now", "play", "life", "achievements", "contact"]
export const SECTION_ORDER = ORDER

export function sceneNumber(id) {
  const i = ORDER.indexOf(id)
  return i < 0 ? "" : String(i + 1).padStart(2, "0")
}

/**
 * Which way the room's camera turns as this section arrives: +1 right, -1
 * left, 0 barely at all. Read off the stations' headings, so retuning a
 * station in stations.js keeps the title's entrance in step with it.
 */
const heading = (id) => {
  const st = STATIONS[id] || DEFAULT_STATION
  return Math.atan2(st.look[0] - st.pos[0], st.look[2] - st.pos[2])
}
function turnInto(id) {
  const i = ORDER.indexOf(id)
  if (i < 1) return 0
  const d = Math.atan2(Math.sin(heading(id) - heading(ORDER[i - 1])), Math.cos(heading(id) - heading(ORDER[i - 1])))
  // A camera panning right swings new things in from the right edge.
  return Math.abs(d) < 0.2 ? 0 : d < 0 ? 1 : -1
}

/**
 * The title arrives from the side the camera is turning toward, swung a few
 * degrees in perspective as if it stood in the room — desktop only, once.
 */
function Swing({ id, children }) {
  const reduced = usePrefersReducedMotion()
  const lowPower = useLowPower()
  const dir = turnInto(id)
  if (reduced || lowPower || !dir) return children
  return (
    <div style={{ perspective: 1400 }}>
      <motion.div
        style={{ transformOrigin: dir > 0 ? "100% 50%" : "0% 50%" }}
        initial={{ x: dir * 56, rotateY: dir * 12 }}
        whileInView={{ x: 0, rotateY: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.2, ease: EASE.ENTER }}
      >
        {children}
      </motion.div>
    </div>
  )
}

function Rule({ grow }) {
  const reduced = usePrefersReducedMotion()
  const cls = `block h-px origin-left ${grow ? "flex-1" : "w-8 md:w-12"}`
  if (reduced) return <span aria-hidden="true" className={cls} style={{ background: "var(--line)" }} />
  return (
    <motion.span
      aria-hidden="true"
      className={cls}
      style={{ background: "var(--line)" }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: DUR.wipe * 1.4, ease: EASE.WIPE, delay: grow ? 0.15 : 0 }}
    />
  )
}

export default function SectionHead({ id, path, meta, metaOnPhones = false, title, aside, titleClassName = "", className = "" }) {
  return (
    <header className={`mb-14 md:mb-20 ${className}`}>
      <Reveal y={10}>
        <div className="flex items-center gap-3 md:gap-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
          <span style={{ color: "var(--accent)" }}>{sceneNumber(id)}</span>
          <Rule />
          <span className="normal-case tracking-[0.08em]">{path}</span>
          <Rule grow />
          {meta && <span className={metaOnPhones ? "whitespace-nowrap" : "hidden sm:inline"}>{meta}</span>}
        </div>
      </Reveal>
      {(title || aside) && (
        <div className="mt-8 md:mt-10 grid gap-6 md:grid-cols-12 md:items-end">
          {title && (
            <div className={aside ? "md:col-span-8" : "md:col-span-12"}>
              <Swing id={id}>
                <AnimatedHeading
                  text={title}
                  as="h2"
                  cinematic
                  className={`font-display uppercase leading-[0.92] text-[clamp(2.5rem,8vw,6.5rem)] ${titleClassName}`}
                />
              </Swing>
            </div>
          )}
          {aside && (
            <Reveal delay={0.15} className="md:col-span-4 md:justify-self-end">
              <p className="max-w-sm text-sm md:text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {aside}
              </p>
            </Reveal>
          )}
        </div>
      )}
    </header>
  )
}
