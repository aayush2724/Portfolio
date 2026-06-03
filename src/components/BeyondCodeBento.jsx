import { motion } from "framer-motion"
import Reveal from "./Reveal"

export default function BeyondCodeBento() {
  return (
    <section id="life" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <Reveal>
          <div className="mb-16">
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
              More Than Code
            </p>
            <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">
              Beyond Code
            </h2>
          </div>
        </Reveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[240px]">
          
          {/* Quote Card - Spans 2 cols */}
          <Reveal delay={0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              className="md:col-span-2 rounded-3xl border p-8 flex flex-col justify-center group transition-all duration-300 hover:border-[var(--accent)]"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <p className="font-display text-3xl md:text-4xl leading-tight mb-6" style={{ color: "var(--fg)" }}>
                "Music is the space between the notes"
              </p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                — Claude Debussy, reminding me that beauty lives in the pauses
              </p>
            </motion.div>
          </Reveal>

          {/* Guitar Card */}
          <Reveal delay={0.2}>
            <motion.div
              whileHover={{ y: -4, rotateZ: 2 }}
              className="rounded-3xl border p-8 flex flex-col justify-between group transition-all duration-300 hover:border-[var(--accent)]"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <div className="text-5xl mb-4">🎸</div>
              <div>
                <h3 className="font-display text-xl mb-2" style={{ color: "var(--fg)" }}>
                  Guitarist
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Stairway to Heaven on repeat
                </p>
              </div>
            </motion.div>
          </Reveal>

          {/* Interests Card */}
          <Reveal delay={0.3}>
            <motion.div
              whileHover={{ y: -4, rotateZ: -2 }}
              className="rounded-3xl border p-8 flex flex-col justify-between group transition-all duration-300 hover:border-[var(--accent)]"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <div className="text-5xl mb-4">📚</div>
              <div>
                <h3 className="font-display text-xl mb-2" style={{ color: "var(--fg)" }}>
                  Learning
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  System design, AI/ML, music theory
                </p>
              </div>
            </motion.div>
          </Reveal>

          {/* Now Playing Card */}
          <Reveal delay={0.4}>
            <motion.div
              whileHover={{ y: -4 }}
              className="md:col-span-2 rounded-3xl border p-8 flex items-center gap-6 group transition-all duration-300 hover:border-[var(--accent)]"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
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
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
              />
            </motion.div>
          </Reveal>

          {/* Philosophy Card - Spans 2 cols */}
          <Reveal delay={0.5}>
            <motion.div
              whileHover={{ y: -4 }}
              className="md:col-span-2 rounded-3xl border p-8 flex flex-col justify-center group transition-all duration-300 hover:border-[var(--accent)]"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <div className="text-4xl mb-4">💭</div>
              <p className="text-lg leading-relaxed" style={{ color: "var(--fg)" }}>
                Code is poetry. Every function a verse, every algorithm a rhythm.{" "}
                <span style={{ color: "var(--accent)" }}>
                  I write software the way I play guitar — with passion, precision, and a bit of improvisation.
                </span>
              </p>
            </motion.div>
          </Reveal>

          {/* Fun Fact Card */}
          <Reveal delay={0.6}>
            <motion.div
              whileHover={{ y: -4, rotateZ: 2 }}
              className="rounded-3xl border p-8 flex flex-col justify-between group transition-all duration-300 hover:border-[var(--accent)]"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <div className="text-5xl mb-4">⚡</div>
              <div>
                <h3 className="font-display text-xl mb-2" style={{ color: "var(--fg)" }}>
                  Fun Fact
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Built a chord detector that understands my guitar better than I do
                </p>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
