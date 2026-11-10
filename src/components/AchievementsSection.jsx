import Reveal from "./Reveal"
import SectionHead from "./SectionHead"
import { achievements } from "../data/storyData"
import { CSS_EASE } from "../context/ease"

/**
 * A ledger, not a card grid: one hairline row per result, numbered, with the
 * proof on the right. Hovering a row draws an accent rule along its top and
 * nudges the title — the only motion it needs.
 */
export default function AchievementsSection() {
  return (
    <section id="achievements" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl 2xl:max-w-[88vw]">
        <SectionHead id="achievements" path="~/achievements.md" meta={`${achievements.length} entries`} title="Achievements" />

        <ol className="border-b" style={{ borderColor: "var(--line)" }}>
          {achievements.map((item, i) => (
            <li key={item.id} className="group relative border-t" style={{ borderColor: "var(--line)" }}>
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 -top-px h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                style={{ background: "var(--accent)", transitionTimingFunction: CSS_EASE.WIPE }}
              />
              <Reveal delay={i * 0.06} y={16}>
                <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 py-7 md:grid-cols-12 md:items-baseline md:gap-x-6 md:py-9">
                  <span
                    className="font-mono text-xs transition-colors duration-300 group-hover:text-[var(--accent)] md:col-span-1"
                    style={{ color: "var(--muted)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="font-display text-2xl uppercase leading-[1.05] transition-transform duration-500 group-hover:translate-x-2 md:col-span-5 md:text-[2rem]"
                    style={{ color: "var(--fg)", transitionTimingFunction: CSS_EASE.ENTER }}
                  >
                    {item.title}
                  </h3>
                  <p className="col-start-2 text-sm leading-relaxed md:col-span-4 md:col-start-auto md:text-[15px]" style={{ color: "var(--muted)" }}>
                    {item.description}
                  </p>
                  <span
                    className="col-start-2 font-mono text-[11px] uppercase tracking-[0.14em] md:col-span-2 md:col-start-auto md:text-right"
                    style={{ color: "var(--fg)" }}
                  >
                    {item.tag}
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
