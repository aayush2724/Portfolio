import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import Reveal, { Stagger, StaggerItem } from "./Reveal"
import TiltCard from "./TiltCard"
import AnimatedHeading from "./AnimatedHeading"
import { useLowPower } from "../context/motion"
import { useNowPlaying } from "../context/useNowPlaying"
import { formatRelative } from "../data/nowPlaying"
import { safeHref, safeImageSrc } from "../lib/safeUrl"

const CARD_STYLE = {
  borderColor: "rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
}

/** Bento cell: tilt + glare via TiltCard, shared border/glass styling. */
function BentoCard({ children, className = "" }) {
  return (
    <TiltCard max={8} className="h-full">
      <div
        className={`h-full rounded-3xl border p-8 transition-colors duration-300 hover:border-[var(--accent)] ${className}`}
        style={CARD_STYLE}
      >
        {children}
      </div>
    </TiltCard>
  )
}

/** What the card shows until Last.fm is configured or has a first scrobble. */
const FALLBACK_TRACK = {
  title: "Stairway to Heaven",
  artist: "Led Zeppelin",
  album: "Led Zeppelin IV (1971)",
  art: null,
  url: null,
  nowPlaying: false,
  playedAt: null,
}

/** Three equaliser bars; they bounce only while a track is live on a device that can afford it. */
function Equaliser({ live, lowPower }) {
  return (
    <div className="flex h-6 items-end gap-[3px]" aria-hidden="true">
      {[0.55, 1, 0.7].map((peak, i) => (
        <motion.span
          key={i}
          className="w-[3px] origin-bottom rounded-full"
          style={{ height: "100%", background: live ? "var(--accent)" : "var(--muted)" }}
          animate={live && !lowPower ? { scaleY: [0.3, peak, 0.45, peak * 0.8, 0.3] } : { scaleY: live ? peak : 0.3 }}
          transition={live && !lowPower ? { duration: 1.1 + i * 0.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        />
      ))}
    </div>
  )
}

/**
 * Live now-playing from Last.fm (see data/nowPlaying.js for the plumbing).
 * Polling runs only while the card is near the viewport.
 */
function NowPlayingCard({ lowPower }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: "200px 0px" })
  const { track, configured } = useNowPlaying({ active: inView })
  const [artBroken, setArtBroken] = useState(false)

  const shown = track || FALLBACK_TRACK
  const live = Boolean(track?.nowPlaying)
  const art = !artBroken && shown.art ? safeImageSrc(shown.art) : null
  const href = shown.url ? safeHref(shown.url) : null
  const label = !track
    ? "Currently Vibing To"
    : live
      ? "Currently Vibing To"
      : shown.playedAt
        ? `Last Played · ${formatRelative(shown.playedAt)}`
        : "Last Played"

  return (
    <div ref={ref} className="h-full">
      {/* Phones: 80px art and the bars share the label row, so the title keeps ~180px.
          Desktop: 96px art, bars as their own column on the right. */}
      <BentoCard className="flex items-center gap-4 md:gap-6">
        <div
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center flex-shrink-0 text-4xl overflow-hidden"
          style={{ background: "rgb(var(--accent-rgb) / 0.1)" }}
        >
          {art ? (
            <img
              key={art}
              src={art}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              onError={() => setArtBroken(true)}
            />
          ) : (
            "🎵"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-wider" style={{ color: live ? "var(--accent)" : "var(--muted)" }}>
              {live && <span className="sr-only">Now playing: </span>}
              {label}
            </p>
            <div className="md:hidden flex-shrink-0">
              <Equaliser live={live} lowPower={lowPower} />
            </div>
          </div>
          <h3 className="font-display text-xl md:text-2xl mb-1 line-clamp-2 leading-tight" style={{ color: "var(--fg)" }}>
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--accent)]">
                {shown.title}
              </a>
            ) : (
              shown.title
            )}
          </h3>
          <p className="text-sm line-clamp-2" style={{ color: "var(--muted)" }}>
            {shown.artist}
            {shown.album ? ` • ${shown.album}` : ""}
          </p>
          {/* Attribution only once something really came from Last.fm, not for the fallback */}
          {configured && track && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              via{" "}
              <a href="https://www.last.fm" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--accent)]">
                Last.fm
              </a>
            </p>
          )}
        </div>
        <div className="hidden md:block flex-shrink-0">
          <Equaliser live={live} lowPower={lowPower} />
        </div>
      </BentoCard>
    </div>
  )
}

export default function BeyondCodeBento() {
  // Decorative pulses/spins run forever; a phone should not pay for them.
  const lowPower = useLowPower()
  return (
    <section id="life" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl 2xl:max-w-[88vw]">

        {/* Header */}
        <Reveal>
          <div className="mb-16">
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
              More Than Code
            </p>
            <AnimatedHeading
              text="Beyond Code"
              as="h2"
              className="font-display text-5xl md:text-7xl uppercase leading-none"
            />
          </div>
        </Reveal>

        {/* Bento Grid */}
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[240px]">

          {/* Quote Card - Spans 2 cols */}
          <StaggerItem className="md:col-span-2">
            <BentoCard className="flex flex-col justify-center">
              <p className="font-display text-3xl md:text-4xl leading-tight mb-6" style={{ color: "var(--fg)" }}>
                "Music is the space between the notes"
              </p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                — Claude Debussy, reminding me that beauty lives in the pauses
              </p>
            </BentoCard>
          </StaggerItem>

          {/* Guitar Card */}
          <StaggerItem>
            <BentoCard className="flex flex-col justify-between">
              <div className="text-5xl mb-4">🎸</div>
              <div>
                <h3 className="font-display text-xl mb-2" style={{ color: "var(--fg)" }}>
                  Guitarist
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Stairway to Heaven on repeat
                </p>
              </div>
            </BentoCard>
          </StaggerItem>

          {/* Interests Card */}
          <StaggerItem>
            <BentoCard className="flex flex-col justify-between">
              <div className="text-5xl mb-4">📚</div>
              <div>
                <h3 className="font-display text-xl mb-2" style={{ color: "var(--fg)" }}>
                  Currently Learning
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  LLMs, RAG pipelines &amp; GenAI — plus system design and music theory
                </p>
              </div>
            </BentoCard>
          </StaggerItem>

          {/* Now Playing Card — live from Last.fm when configured */}
          <StaggerItem className="md:col-span-2">
            <NowPlayingCard lowPower={lowPower} />
          </StaggerItem>

          {/* Philosophy Card - Spans 2 cols */}
          <StaggerItem className="md:col-span-2">
            <BentoCard className="flex flex-col justify-center">
              <div className="text-4xl mb-4">💭</div>
              <p className="text-lg leading-relaxed" style={{ color: "var(--fg)" }}>
                Code is poetry. Every function a verse, every algorithm a rhythm.{" "}
                <span style={{ color: "var(--accent)" }}>
                  I write software the way I play guitar — with passion, precision, and a bit of improvisation.
                </span>
              </p>
            </BentoCard>
          </StaggerItem>

          {/* Fun Fact Card */}
          <StaggerItem>
            <BentoCard className="flex flex-col justify-between">
              <div className="text-5xl mb-4">⚡</div>
              <div>
                <h3 className="font-display text-xl mb-2" style={{ color: "var(--fg)" }}>
                  Fun Fact
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Built a chord detector that understands my guitar better than I do
                </p>
              </div>
            </BentoCard>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  )
}
