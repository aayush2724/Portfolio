import { useState } from "react"
import {
  siReact, siTypescript, siJavascript, siNodedotjs, siPython, siCplusplus,
  siFastapi, siMongodb, siPostgresql, siRedis, siDocker, siGit,
  siTailwindcss, siThreedotjs, siFirebase, siVercel, siLangchain,
} from "simple-icons"
import { useLowPower, usePrefersReducedMotion } from "../context/motion"

/**
 * A band of tech marks riding a standing wave, drifting left forever.
 *
 * The wave reads as stationary while the icons travel through it. That falls
 * out of WAVES being a whole number rather than needing a per-frame position
 * read — see the constant below.
 *
 * Marks are monochrome until pointed at, then they take their brand colour and
 * say their name. That is load-bearing, not decoration: two of these brands
 * (Three.js, Vercel) are #000000 and would be invisible on this page, so a
 * muted resting state is what lets one treatment cover every mark.
 */

/** Item box width in px — fixes the spacing the wave is sampled across. */
const ITEM = 84
/** Peak vertical displacement, in px. */
const AMP = 26
/**
 * Whole sine periods across ONE copy of the list. The integer is the point:
 * the track loops by exactly one copy-width, which is therefore a whole number
 * of periods, so the crests stay pinned in place across the seam.
 */
const WAVES = 2

const TECH = [
  siReact, siTypescript, siJavascript, siNodedotjs, siPython, siCplusplus,
  siFastapi, siMongodb, siPostgresql, siRedis, siLangchain, siDocker,
  siGit, siTailwindcss, siThreedotjs, siFirebase, siVercel,
].map((i) => ({
  title: i.title,
  path: i.path,
  // Pure-black brands are unreadable on #0a0a0b; fall back to the foreground.
  hex: /^0{6}$/i.test(i.hex) ? "FFFFFF" : i.hex,
}))

const N = TECH.length

function Mark({ tech, index, active, onActivate, onClear }) {
  const y = AMP * Math.sin((2 * Math.PI * WAVES * index) / N)

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: ITEM, transform: `translateY(${y.toFixed(2)}px)` }}
      onMouseEnter={onActivate}
      onMouseLeave={onClear}
      /* Tap is the touch equivalent of hover — without it the names, which are
         most of this component's content, are unreachable on a phone. */
      onClick={onActivate}
    >
      {/*
        Lift, scale and colour are plain CSS transitions rather than a
        framer-motion `animate`. Two reasons: 34 motion components each holding
        a subscription is a lot of machinery for a hover tint, and — the reason
        this was rewritten — framer drives its values from requestAnimationFrame,
        so on a throttled or backgrounded tab the mark under the cursor stays
        grey while its name plate appears. A CSS transition is immune to that
        and runs on the compositor.
      */}
      <div
        className="cursor-pointer"
        style={{
          color: active ? `#${tech.hex}` : "rgba(255,255,255,0.38)",
          transform: active ? "translateY(-8px) scale(1.45)" : "none",
          transition: "color 220ms ease, transform 260ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" role="img" aria-label={tech.title}>
          <path d={tech.path} />
        </svg>
      </div>

      {/* Rendered only while active, so the ~34 idle marks on screen cost no
          extra layout or paint. */}
      {active && (
        <span
          className="pointer-events-none absolute top-full mt-4 whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[11px]"
          style={{
            borderColor: "var(--line)",
            background: "rgba(10,10,11,0.92)",
            color: "var(--fg)",
            animation: "tech-plate-in 160ms ease both",
          }}
        >
          {tech.title}
        </span>
      )}
    </div>
  )
}

export default function TechWave() {
  const lowPower = useLowPower()
  const reduced = usePrefersReducedMotion()
  // Indexed across both copies so hovering a mark doesn't also light its twin.
  const [active, setActive] = useState(null)

  const marks = [...TECH, ...TECH]
  const duration = lowPower ? 46 : 34

  return (
    <div
      className="relative select-none overflow-hidden"
      /* Room for the crests plus the name plate hanging under the lowest mark. */
      style={{ height: AMP * 2 + 116 }}
      onMouseLeave={() => setActive(null)}
    >
      {/* Centring lives on this wrapper, not the track: the track's transform is
          owned by the drift animation and a Tailwind -translate-y would be
          overwritten by the first keyframe. */}
      <div className="absolute inset-0 flex items-center">
        <div
          className="flex w-[200%] items-center"
          style={
            reduced
              ? undefined
              : {
                  animation: `tech-wave-drift ${duration}s linear infinite`,
                  // Freeze under the cursor — otherwise the mark you are
                  // reading slides away mid-word.
                  animationPlayState: active !== null ? "paused" : "running",
                  willChange: "transform",
                }
          }
        >
          {marks.map((tech, i) => (
            <Mark
              key={`${tech.title}-${i}`}
              tech={tech}
              index={i}
              active={active === i}
              onActivate={() => setActive(i)}
              onClear={() => setActive(null)}
            />
          ))}
        </div>
      </div>

      {/* Marks dissolve into the page rather than being sliced by the overflow box. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-24"
           style={{ background: "linear-gradient(to right, var(--bg), transparent)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-24"
           style={{ background: "linear-gradient(to left, var(--bg), transparent)" }} />
    </div>
  )
}
