import { motion } from "framer-motion"
import Reveal, { Stagger, StaggerItem } from "./Reveal"
import TiltCard from "./TiltCard"
import AnimatedHeading from "./AnimatedHeading"
import { useLowPower } from "../context/motion"

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

export default function BeyondCodeBento() {
  // Decorative pulses/spins run forever; a phone should not pay for them.
  const lowPower = useLowPower()
  return (
    <section id="life" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">

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
                  Learning
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  System design, AI/ML, music theory
                </p>
              </div>
            </BentoCard>
          </StaggerItem>

          {/* Now Playing Card */}
          <StaggerItem className="md:col-span-2">
            <BentoCard className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 text-4xl" style={{ background: "rgba(212, 255, 63, 0.1)" }}>
                🎵
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                  Currently Vibing To
                </p>
                <h3 className="font-display text-2xl mb-1" style={{ color: "var(--fg)" }}>
                  Stairway to Heaven
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Led Zeppelin • Led Zeppelin IV (1971)
                </p>
              </div>
              <motion.div
                animate={lowPower ? undefined : { scale: [1, 1.1, 1] }}
                transition={lowPower ? undefined : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
              />
            </BentoCard>
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
