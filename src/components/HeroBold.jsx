import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion"
import { LEETCODE_SOLVED, REPO_COUNT, HACKATHONS, CONTRIBUTION_CALENDAR } from "../data/stats"
import { recentActivity } from "../data/contributions"
import { useEffect, useRef, useState } from "react"
import MagneticButton from "./MagneticButton"
import CountUp from "./CountUp"
import { sceneNumber } from "./SectionHead"
import { usePrefersReducedMotion, useLowPower } from "../context/motion"
import { EASE as MOTION, DUR } from "../context/ease"
import { useIstClock } from "../context/useIstClock"

const EASE = [0.22, 1, 0.36, 1]

/**
 * The landing frame. One idea per layer:
 *   rail      where you are (scene 01), local time, availability
 *   name      the kinetic signature, untouched
 *   line      who this is, in one factual sentence
 *   actions   the work, or the shell
 *   ticker    the terminal voice, one command at a time
 *   portrait  a framed photograph, not a glowing card
 *   strip     three numbers on a rule
 * No glows, particles, rotating borders, float loops or bouncing scroll
 * arrows — the room behind the page is the depth.
 */

/**
 * One letter of the kinetic name. The outer span handles the intro rise
 * (clip reveal), the inner span carries the scroll-linked settle so the
 * two transforms never fight over the same property.
 *
 * `lite` drops the scroll-linked layer entirely. The full version creates three
 * motion values per letter (33 across the name), each writing transform+opacity
 * to its own span on every scroll frame — far too much for a phone.
 */
function KineticLetter({ ch, i, scrollY, delay, reduced, introDone, lite }) {
  const y = useTransform(scrollY, [0, 500], [0, -(18 + i * 12)])
  const opacity = useTransform(scrollY, [0, 320 + i * 35], [1, 0.1])
  const skewX = useTransform(scrollY, [0, 500], [0, -(1.5 + i * 0.5)])

  if (reduced) return <span className="inline-block">{ch}</span>

  // Intro rise still plays on mobile; only the per-frame scroll work is cut.
  if (lite) {
    return (
      <span className="inline-block overflow-hidden align-bottom">
        <motion.span
          className="inline-block"
          initial={{ y: "110%" }}
          animate={{ y: introDone ? "0%" : "110%" }}
          transition={{ duration: 0.7, delay, ease: EASE }}
        >
          {ch}
        </motion.span>
      </span>
    )
  }

  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        className="inline-block will-change-transform"
        initial={{ y: "110%" }}
        animate={{ y: introDone ? "0%" : "110%" }}
        transition={{ duration: 0.7, delay, ease: EASE }}
      >
        <motion.span className="inline-block" style={{ y, opacity, skewX }}>
          {ch}
        </motion.span>
      </motion.span>
    </span>
  )
}

function KineticLine({ text, className = "", scrollY, baseDelay, reduced, introDone, lite }) {
  return (
    <span className={"block " + className} aria-hidden="true">
      {text.split("").map((ch, i) => (
        <KineticLetter
          key={i}
          ch={ch}
          i={i}
          scrollY={scrollY}
          delay={baseDelay + i * 0.045}
          reduced={reduced}
          introDone={introDone}
          lite={lite}
        />
      ))}
    </span>
  )
}

const STEPS = [
  { cmd: "whoami", out: "Aayush Kumar — CS student, full-stack dev & OWASP President" },
  { cmd: "cat skills.txt", out: "Python · FastAPI · LangGraph · RAG · Node · Redis · React · Docker" },
  { cmd: "ls projects/", out: "translog  auralis  algovision  deskguard  leadforge  mindflow" },
  { cmd: "cat achievements.txt", out: "3rd @ NIT Trichy · GS Hackathon · Samsung ennovateX" },
  { cmd: "echo $ROLE", out: "Backend & AI Intern @ HSH Technologies · OWASP Chapter President" },
  { cmd: "./launch --status", out: "open to internships & collaboration" },
]

/**
 * The ticker opens on proof of work: the last day with GitHub activity and
 * the 30 days before it, from the synced contribution calendar (the same
 * data the Stats heatmap draws). Dated, not "N days ago", so it stays true
 * however old the sync is. Skipped when there is no calendar.
 */
const ACTIVITY = recentActivity(CONTRIBUTION_CALENDAR)
const dayMonth = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })
const TICKER = ACTIVITY
  ? [
      {
        cmd: "git log -1 --date=short",
        out: `last active ${dayMonth(ACTIVITY.lastDate)} · ${ACTIVITY.last30} contributions in the prior 30 days`,
      },
      ...STEPS,
    ]
  : STEPS

/**
 * The terminal, one line at a time: types a command, prints its output,
 * holds, moves on. Pauses off screen; static under reduced motion.
 */
function CommandTicker({ run }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(true)
  const [i, setI] = useState(0)
  const [typed, setTyped] = useState(0)
  const [printed, setPrinted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!run || !visible) return
    const step = TICKER[i]
    let t
    if (typed < step.cmd.length) t = setTimeout(() => setTyped(typed + 1), 48)
    else if (!printed) t = setTimeout(() => setPrinted(true), 280)
    else
      t = setTimeout(() => {
        setPrinted(false)
        setTyped(0)
        setI((i + 1) % TICKER.length)
      }, 2800)
    return () => clearTimeout(t)
  }, [run, visible, i, typed, printed])

  const step = TICKER[i]
  const cmd = run ? step.cmd.slice(0, typed) : step.cmd
  const out = run ? printed : true
  return (
    <div ref={ref} aria-hidden="true" className="font-mono text-[12px] md:text-[13px] leading-relaxed">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span style={{ color: "var(--accent)" }}>➜</span>
        <span style={{ color: "var(--muted)" }}>~</span>
        <span style={{ color: "var(--fg)" }}>{cmd}</span>
        <span className="hero-caret inline-block h-[1.05em] w-[0.5em]" style={{ background: "var(--accent)" }} />
      </div>
      <p
        className="mt-1 truncate"
        style={{ color: "var(--muted)", opacity: out ? 1 : 0, transition: "opacity 0.3s ease" }}
      >
        {step.out}
      </p>
    </div>
  )
}

/** Brightness ramp for the scan, dark to light. */
const RAMP = " .:-=+*#%@"

/**
 * Draws the portrait once as terminal ASCII: the photo is sampled per
 * character cell (object-cover crop, like the <img>), and each cell's
 * luminance picks a glyph and its strength in the accent colour.
 */
function drawAscii(canvas, img) {
  const box = canvas.parentElement
  const w = box.offsetWidth
  const h = box.offsetHeight
  if (!w || !h || !img.naturalWidth) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  const cw = 7
  const ch = 11
  const cols = Math.floor(w / cw)
  const rows = Math.floor(h / ch)
  const probe = document.createElement("canvas")
  probe.width = cols
  probe.height = rows
  const px = probe.getContext("2d", { willReadFrequently: true })
  const ir = img.naturalWidth / img.naturalHeight
  const br = w / h
  let sw = img.naturalWidth
  let sh = img.naturalHeight
  if (ir > br) sw = sh * br
  else sh = sw / br
  px.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, cols, rows)
  const data = px.getImageData(0, 0, cols, rows).data
  const root = getComputedStyle(document.documentElement)
  const accent = root.getPropertyValue("--accent-rgb").trim().split(/\s+/).join(",") || "212,255,63"
  const ctx = canvas.getContext("2d")
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = root.getPropertyValue("--bg").trim() || "#09090b"
  ctx.fillRect(0, 0, w, h)
  ctx.font = `${ch - 1}px "JetBrains Mono", ui-monospace, monospace`
  ctx.textBaseline = "top"
  const ox = (w - cols * cw) / 2
  const oy = (h - rows * ch) / 2
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 4
      const raw = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
      const lum = Math.min(1, Math.max(0, (raw - 0.08) / 0.84))
      const g = Math.round(lum * (RAMP.length - 1))
      if (!g) continue
      ctx.fillStyle = `rgba(${accent},${(0.22 + 0.78 * lum).toFixed(2)})`
      ctx.fillText(RAMP[g], ox + c * cw, oy + r * ch)
    }
  }
}

/**
 * Scrolling past the hero, a scanline sweeps down the photograph and leaves
 * it rendered as ASCII behind it — the portrait as the shell would print it.
 * The ASCII frame is drawn once (and on resize); scroll only moves a clip
 * and the line, so the effect costs a composite, not a redraw.
 */
function AsciiScan({ imgRef, ready, progress }) {
  const canvas = useRef(null)
  const bottom = useTransform(progress, [0, 1], [100, 0])
  const clipPath = useMotionTemplate`inset(0% 0% ${bottom}% 0%)`
  const lineTop = useTransform(progress, (v) => `${v * 100}%`)
  const lineOpacity = useTransform(progress, [0, 0.03, 0.97, 1], [0, 1, 1, 0])

  useEffect(() => {
    const c = canvas.current
    const img = imgRef.current
    if (!ready || !c || !img) return undefined
    let alive = true
    const draw = () => alive && drawAscii(c, img)
    ;(document.fonts?.ready ?? Promise.resolve()).then(draw)
    let t = 0
    const ro = new ResizeObserver(() => {
      clearTimeout(t)
      t = setTimeout(draw, 150)
    })
    ro.observe(c.parentElement)
    return () => {
      alive = false
      clearTimeout(t)
      ro.disconnect()
    }
  }, [ready, imgRef])

  return (
    <>
      <motion.canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" style={{ clipPath }} />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{
          top: lineTop,
          opacity: lineOpacity,
          background: "var(--accent)",
          boxShadow: "0 0 12px 1px rgb(var(--accent-rgb) / 0.7)",
        }}
      />
    </>
  )
}

/**
 * The photograph: a clip wipe up on intro, a registration rule offset behind
 * it, grayscale until hovered, a few pixels of drift against the cursor, and
 * (desktop) the ASCII scan as the hero scrolls away.
 */
function Portrait({ introDone, reduced, heavy, scan }) {
  const [hover, setHover] = useState(false)
  const imgRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 110, damping: 18 })
  const y = useSpring(my, { stiffness: 110, damping: 18 })
  const onMove = (e) => {
    if (!heavy) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * -14)
    my.set(((e.clientY - r.top) / r.height - 0.5) * -14)
  }
  const onLeave = () => {
    setHover(false)
    mx.set(0)
    my.set(0)
  }

  return (
    <figure className="relative w-full max-w-[400px] md:max-w-[min(400px,38vh)]">
      <div className="relative">
      {/* registration rule: the photograph's outline, offset behind it */}
      <motion.span
        aria-hidden="true"
        className="absolute border"
        style={{ top: 16, left: 16, right: -16, bottom: -16, borderColor: "rgb(var(--fg-rgb) / 0.16)" }}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: DUR.enter, delay: 1.1 }}
      />
      <motion.div
        className="relative overflow-hidden"
        style={{ background: "var(--surface)", aspectRatio: "3 / 4" }}
        initial={reduced ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
        animate={reduced ? undefined : { clipPath: introDone ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
        transition={{ duration: 1.15, ease: MOTION.WIPE, delay: 0.35 }}
        onMouseEnter={() => setHover(true)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <motion.div className="h-full w-full" style={heavy ? { x, y, scale: 1.06 } : undefined}>
          {/* Responsive portrait: a phone pulls the 448px webp (~24KB) instead
              of the original 3072x4080 JPEG, cutting decode by ~26x. */}
          <picture>
            <source type="image/webp" srcSet="/portrait-448.webp 448w, /portrait-896.webp 896w" sizes="(max-width: 768px) 90vw, 420px" />
            <source type="image/jpeg" srcSet="/portrait-448.jpg 448w, /portrait-896.jpg 896w" sizes="(max-width: 768px) 90vw, 420px" />
            <motion.img
              ref={imgRef}
              onLoad={() => setLoaded(true)}
              src="/portrait-896.jpg"
              alt="Portrait of Aayush Kumar - Full-stack developer and CS student"
              loading="eager"
              decoding="async"
              fetchpriority="high"
              width={896}
              height={1190}
              className="h-full w-full object-cover"
              style={{
                filter: hover ? "grayscale(0) contrast(1)" : "grayscale(1) contrast(1.06) brightness(0.92)",
                transition: "filter 0.7s ease",
              }}
              initial={reduced ? false : { scale: 1.18 }}
              animate={reduced ? undefined : { scale: introDone ? 1 : 1.18 }}
              transition={{ duration: 1.6, ease: MOTION.ENTER, delay: 0.35 }}
              onError={(e) => {
                e.target.style.display = "none"
                e.target.parentElement.style.background = `linear-gradient(135deg, var(--surface), var(--bg))`
              }}
            />
          </picture>
          {heavy && scan && <AsciiScan imgRef={imgRef} ready={loaded} progress={scan} />}
        </motion.div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to top, rgb(var(--bg-rgb) / 0.55) 0%, transparent 35%)" }}
        />
      </motion.div>
      </div>
      <motion.figcaption
        className="mt-8 flex justify-between gap-4 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color: "var(--muted)" }}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: DUR.enter, delay: 1.2 }}
      >
        <span>fig. 01</span>
        <span>Aayush Kumar</span>
      </motion.figcaption>
    </figure>
  )
}

export default function HeroBold({ introDone = true }) {
  const reduced = usePrefersReducedMotion()
  const lowPower = useLowPower()
  const { scrollY } = useScroll()
  // Parallax: text column climbs faster than the portrait, so the layers
  // separate against the room behind. Desktop only — on a phone this forces
  // a main-thread transform write every scroll frame.
  const textY = useTransform(scrollY, [0, 600], [0, -90])
  const portraitY = useTransform(scrollY, [0, 600], [0, 50])
  // The ASCII scan runs over the first ~third of a screen, while the photo is still in view.
  const scan = useTransform(scrollY, [0, 320], [0, 1], { clamp: true })
  const clock = useIstClock()

  const showStats = introDone || reduced
  const heavy = !reduced && !lowPower

  // Intro helper: fade-rise gated on the intro having finished.
  const intro = (delay) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
          transition: { duration: 0.6, delay, ease: EASE },
        }

  const stats = [
    { end: LEETCODE_SOLVED, suffix: "+", label: "DSA problems solved", duration: 2, href: "#stats" },
    { end: REPO_COUNT, suffix: "+", label: "Projects shipped", duration: 1.4, href: "#projects" },
    { end: HACKATHONS, suffix: "×", label: "Hackathon finalist", duration: 1, href: "#achievements" },
  ]

  return (
    <section id="hero" className="relative flex min-h-screen flex-col justify-center px-6 pb-14 pt-28 md:px-16 md:pb-24 md:pt-24">
      {/* The room shows through on the portrait's side only: the text column
          sits on a soft scrim so nothing in the set runs behind the headline. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ background: "linear-gradient(90deg, rgb(var(--bg-rgb) / 0.72) 0%, rgb(var(--bg-rgb) / 0.5) 38%, transparent 64%)" }}
      />
      <div className="relative mx-auto w-full max-w-7xl 2xl:max-w-[88vw]">
        {/* Rail: scene, time, status */}
        <motion.div
          {...intro(0)}
          className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] md:gap-4 md:text-[11px]"
          style={{ color: "var(--muted)" }}
        >
          <span style={{ color: "var(--accent)" }}>{sceneNumber("hero")}</span>
          <span aria-hidden="true" className="h-px w-8 md:w-12" style={{ background: "var(--line)" }} />
          <span className="normal-case tracking-[0.08em]">~/index</span>
          <span aria-hidden="true" className="h-px flex-1" style={{ background: "var(--line)" }} />
          <span className="hidden md:inline">Mysore, IN · {clock} IST</span>
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ok)" }} />
            Open to work
          </span>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 items-end gap-14 md:mt-10 md:grid-cols-12 md:gap-10">
          <motion.div style={heavy ? { y: textY } : undefined} className="flex min-w-0 flex-col md:col-span-7 lg:col-span-8">
            {/* Kinetic name: letters rise on intro, un-settle with stagger on scroll */}
            <h1 aria-label="Aayush Kumar" className="font-display uppercase leading-[0.82] text-[18vw] md:text-[10vw] lg:text-[8.2vw]">
              <KineticLine text="Aayush" scrollY={scrollY} baseDelay={0.1} reduced={reduced} introDone={introDone} lite={lowPower} />
              <KineticLine
                text="Kumar"
                className="text-[var(--accent)]"
                scrollY={scrollY}
                baseDelay={0.25}
                reduced={reduced}
                introDone={introDone}
                lite={lowPower}
              />
            </h1>

            <motion.p {...intro(0.55)} className="mt-7 max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: "var(--muted)" }}>
              <span style={{ color: "var(--fg)" }}>Backend & AI intern</span> at HSH Technologies, CS student at NIE Mysore, and
              president of its <span style={{ color: "var(--fg)" }}>OWASP chapter</span>.
            </motion.p>

            <motion.div {...intro(0.7)} className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <MagneticButton
                as={motion.a}
                href="#projects"
                className="inline-flex w-fit items-center gap-3 rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent-ink)] transition-all duration-300 hover:gap-5"
              >
                View work →
              </MagneticButton>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-shell"))}
                className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] transition-colors hover:text-[var(--fg)]"
                style={{ color: "var(--muted)" }}
              >
                Open the shell
                <kbd className="hidden rounded border px-1.5 py-0.5 normal-case tracking-normal transition-colors group-hover:border-[var(--accent)] md:inline" style={{ borderColor: "var(--line)" }}>
                  ⌘K
                </kbd>
              </button>
            </motion.div>

            <motion.div {...intro(0.85)} className="mt-9 max-w-xl border-t pt-5" style={{ borderColor: "var(--line)" }}>
              <CommandTicker run={!reduced && introDone} />
            </motion.div>
          </motion.div>

          <motion.div style={heavy ? { y: portraitY } : undefined} className="flex md:col-span-5 md:justify-end lg:col-span-4">
            <Portrait introDone={introDone} reduced={reduced} heavy={heavy} scan={reduced ? null : scan} />
          </motion.div>
        </div>

        {/* Numbers on a rule — each one goes to where it's proven */}
        <motion.nav {...intro(0.95)} aria-label="Highlights" className="mt-14 grid grid-cols-3 border-t md:mt-12" style={{ borderColor: "var(--line)" }}>
          {stats.map((s, i) => (
            <a
              key={s.label}
              href={s.href}
              className={`group flex flex-col-reverse gap-2 pt-5 ${i ? "border-l pl-4 md:pl-8" : "pr-4"}`}
              style={{ borderColor: "var(--line)" }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] transition-colors group-hover:text-[var(--fg)] md:text-[11px]" style={{ color: "var(--muted)" }}>
                {s.label}
                <span aria-hidden="true" className="ml-2 inline-block opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  →
                </span>
              </span>
              <span className="font-display text-3xl transition-colors duration-300 group-hover:text-[var(--accent)] md:text-5xl" style={{ color: "var(--fg)" }}>
                {showStats ? <CountUp end={s.end} duration={s.duration} suffix={s.suffix} /> : "0"}
              </span>
            </a>
          ))}
        </motion.nav>
      </div>

    </section>
  )
}
