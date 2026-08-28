import Reveal, { Stagger, StaggerItem } from "./Reveal"
import TiltCard from "./TiltCard"
import CommandLabel from "./CommandLabel"
import { achievements } from "../data/storyData"
import AnimatedHeading from "./AnimatedHeading"

export default function AchievementsSection() {
  return (
    <section id="achievements" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <CommandLabel className="mb-6">cat achievements.md</CommandLabel>
        </Reveal>

        <Reveal>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-14">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
                Resume Highlights
              </p>
              <AnimatedHeading
                text="Achievements"
                as="h2"
                className="font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-none"
              />
            </div>
            <p className="max-w-xl text-sm md:text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              A compact snapshot of the milestones I care about most: competitive results, problem-solving depth, and shipped work.
            </p>
          </div>
        </Reveal>

        <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((item) => (
            <StaggerItem key={item.id} className="h-full">
              <TiltCard max={6} className="h-full">
                <article
                  className="h-full rounded-3xl border p-6 md:p-7 transition-colors duration-300"
                  style={{
                    borderColor: "var(--line)",
                    background: "rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl"
                      style={{ borderColor: "var(--line)", background: "rgba(255, 255, 255, 0.03)" }}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-display text-2xl leading-tight mb-2" style={{ color: "var(--fg)" }}>
                        {item.title}
                      </h3>
                      <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--muted)" }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
