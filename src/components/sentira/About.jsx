import Reveal from "../Reveal"
import { Card, Pill, SectionHead } from "./ui"
import data from "../../data/portfolioData.json"
import { projects } from "../../data/projects"

/**
 * The bento. Two unequal cards: a tall image panel carrying one oversized
 * serif number, and a narrower panel that opens with prose and closes with a
 * rule-separated metric list.
 *
 * The asymmetry is the point — an even split would read as a comparison, and
 * these two halves are not comparable. 1.6fr/1fr keeps the image dominant while
 * leaving the metrics enough width that no value wraps.
 */

const { leetcode } = data

const METRICS = [
  { label: "LeetCode Problems Solved", value: `${leetcode.stats.totalSolved}+` },
  /* projects.js is the curated list; github[] is only the 12 most recently
     pushed repos, which understates the count and drifts on every sync. */
  { label: "Projects Shipped", value: `${projects.length}` },
  { label: "Current Solving Streak", value: `${leetcode.streak} days` },
]

export default function About() {
  return (
    <section id="about" className="relative px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1180px]">
        {/* Heading left, CTA right — the reference's asymmetric section head */}
        <div className="mb-14 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Reveal>
            <SectionHead
              label="About me"
              align="left"
              lines={["Built to make software", "work for people."]}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <Pill as="a" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              Download résumé
            </Pill>
          </Reveal>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
          {/* Image panel */}
          <Reveal>
            <Card className="relative h-full min-h-[380px] overflow-hidden md:min-h-[440px]">
              <picture>
                <source srcSet="/portrait-896.webp" type="image/webp" />
                <img
                  src="/portrait-896.jpg"
                  alt="Aayush Kumar"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  /* Duotone via filters rather than a blend mode: the low-power
                     stylesheet strips mix-blend-mode on phones, which would
                     leave the portrait in full colour against a monochrome
                     page. A filter chain survives that. */
                  style={{
                    filter:
                      "grayscale(1) sepia(1) hue-rotate(52deg) saturate(1.35) brightness(0.38) contrast(1.25)",
                  }}
                />
              </picture>

              {/* Floor gradient so the serif number never lands on busy pixels */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(6,6,6,0.96) 0%, rgba(6,6,6,0.8) 28%, rgba(6,6,6,0.3) 58%, rgba(6,6,6,0.08) 100%)",
                }}
              />

              <div className="absolute inset-x-0 bottom-0 p-7 md:p-8">
                <p className="font-display text-[64px] leading-none md:text-[76px]">
                  {leetcode.stats.totalSolved}+
                </p>
                <p className="mt-3 text-[15px]" style={{ color: "var(--fg)" }}>
                  Problems solved in C++
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  {leetcode.totalActiveDays} active days of deliberate practice —
                  the habit behind everything else on this page.
                </p>
              </div>
            </Card>
          </Reveal>

          {/* Prose + metrics panel */}
          <Reveal delay={0.1}>
            <Card className="flex h-full flex-col justify-between p-7 md:p-8">
              <p className="text-[15px] leading-[1.65]" style={{ color: "var(--muted)" }}>
                I'm a Computer Science student at NIE Mysore who ships end to end
                — React interfaces, Python and Node services, and the real-time
                infrastructure between them. I've led the OWASP student chapter
                as President, placed 3rd at NIT Trichy's hackathon with
                LeadForge, and now build LLM features and RAG pipelines in
                production as an AI engineering intern.
              </p>

              {/* Metric rules. The first row has no top border so the list reads
                  as three entries rather than a boxed table. */}
              <dl className="mt-10 md:mt-0">
                {METRICS.map((m, i) => (
                  <div
                    key={m.label}
                    className="flex items-baseline justify-between gap-4 py-4"
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--line)",
                    }}
                  >
                    <dt className="text-[15px]" style={{ color: "var(--fg)" }}>
                      {m.label}
                    </dt>
                    <dd
                      className="font-display shrink-0 text-xl"
                      style={{ color: "var(--muted)" }}
                    >
                      {m.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
