import { LEETCODE_SOLVED } from "../data/stats"
import Reveal from "./Reveal"
import SectionHead from "./SectionHead"
import ScrollRevealText from "./ScrollRevealText"

/** Label → value, set as a ruled definition list. */
const FACTS = [
  ["Studying", "3rd-year B.E. CSE (AI & ML) · NIE Mysore · 9.3/10 CGPA"],
  ["Based in", "India · IST"],
  ["Open to", "Remote internships, freelance work, and collaborations"],
  ["Into", "Guitar, DSA, system design, open source"],
  ["On repeat", "Stairway to Heaven — Led Zeppelin"],
]

export default function AboutBold() {
  return (
    <section id="about" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl 2xl:max-w-[88vw]">
        {/* The manifesto is display copy, not a title — this names the landmark for assistive tech. */}
        <h2 className="sr-only">About</h2>

        <SectionHead id="about" path="~/about.md" meta="NIE Mysore · India" className="!mb-10 md:!mb-14" />

        {/* Manifesto — brightens word by word as it scrolls into view */}
        <ScrollRevealText
          as="div"
          className="relative font-display text-4xl md:text-6xl lg:text-7xl leading-tight mb-16 md:mb-24 text-[var(--fg)]"
          segments={[
            { text: "I ship software" },
            { text: "end to end", className: "text-[var(--accent)]" },
            { text: "— from the React screen you click to the Python service and the AI behind it." },
          ]}
        />

        <div className="grid gap-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
          {/* Bio */}
          <Reveal delay={0.2}>
            <div className="space-y-6">
              <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
                I'm Aayush, President of the OWASP NIE Student Chapter and a backend and AI builder.
                My experience includes two months of freelance work with Outlier AI, testing model performance and evaluating response quality.
              </p>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
                I'm currently building <span style={{ color: "var(--fg)" }}>Beatzy</span>, a music intelligence SaaS
                with real-time audio fingerprinting. I recently shipped Auralis, an AI sales bot that reached the
                Innovac grand finale, and built LeadForge, an AI B2B lead pipeline that placed third at NIT Trichy.
                I like exploring unfamiliar codebases, testing new ideas with AI-native tools, and shipping quickly.
              </p>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
                Beyond code, you'll find me playing{" "}
                <span style={{ color: "var(--fg)" }}>Stairway to Heaven</span>{" "}
                on my guitar or grinding{" "}
                <span style={{ color: "var(--fg)" }}>{LEETCODE_SOLVED}+ LeetCode problems</span>{" "}
                in C++.
              </p>
            </div>
          </Reveal>

          {/* At a glance */}
          <Reveal delay={0.3}>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
              At a glance
            </p>
            <dl className="border-t" style={{ borderColor: "var(--line)" }}>
              {FACTS.map(([label, value]) => (
                <div
                  key={label}
                  className="group grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b py-4 md:grid-cols-[8rem_1fr]"
                  style={{ borderColor: "var(--line)" }}
                >
                  <dt
                    className="font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 group-hover:text-[var(--accent)]"
                    style={{ color: "var(--muted)" }}
                  >
                    {label}
                  </dt>
                  <dd className="text-[15px] leading-snug" style={{ color: "var(--fg)" }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
