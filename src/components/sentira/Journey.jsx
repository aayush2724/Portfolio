import Reveal, { Stagger, StaggerItem } from "../Reveal"
import { SectionHead } from "./ui"

/**
 * The timeline, rebuilt as a two-column register: the year sits in a narrow
 * left gutter and the entry fills the rest, separated by the same hairline used
 * by the service rows.
 *
 * A repeated year is rendered as blank space rather than repeated text, so a
 * year reads as a heading for the block beneath it. That is the whole reason
 * this works without a rail, a dot or a connecting line.
 */

const MILESTONES = [
  {
    year: 2023,
    title: "Started the journey",
    body: "Found programming and stayed for the problem-solving. Fundamentals first — the unglamorous part that everything later rests on.",
  },
  {
    year: 2024,
    title: "Data structures & the web",
    body: "Went deep on DSA while picking up web development on the side. The two have fed each other ever since.",
  },
  {
    year: 2025,
    title: "First real applications",
    body: "Visitor Management and a live ChatRoom, built on PHP, MySQL and Socket.io. The first things I made that other people actually used.",
  },
  {
    year: 2025,
    title: "Full-stack breakthrough",
    body: "React, Node and MongoDB clicked together. Citizen Resolver, Job Portal and SkillNest all shipped end to end in this stretch.",
  },
  {
    year: 2025,
    title: "Into machine learning",
    body: "Chord Detector, the Disaster Relief System's real-time layer, and LeadForge — the point where AI stopped being a topic and became a tool.",
  },
  {
    year: 2026,
    title: "Systems & architecture",
    body: "DeskGuard and AlgoVision, built with performance and production-grade UI engineering as the actual goal rather than an afterthought.",
  },
  {
    year: 2026,
    title: "OWASP chapter President",
    body: "Took over the OWASP student chapter at NIE — running workshops, organising sessions and building a security community on campus.",
  },
  {
    year: 2026,
    title: "First internship — AI engineer",
    body: "Into industry: LLM-powered features, RAG pipelines and agentic workflows, shipped to production rather than to a demo.",
  },
]

export default function Journey() {
  return (
    <section id="journey" className="relative px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <SectionHead
            className="mb-16"
            label="Journey"
            lines={["Three years, told", "in what shipped."]}
          />
        </Reveal>

        <Stagger className="flex flex-col" stagger={0.06}>
          {MILESTONES.map((m, i) => {
            const isNewYear = i === 0 || MILESTONES[i - 1].year !== m.year

            return (
              <StaggerItem key={`${m.year}-${m.title}`}>
                <div
                  className="grid grid-cols-[64px_1fr] gap-5 py-7 md:grid-cols-[140px_1fr] md:gap-10"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
                >
                  <span
                    className="font-display text-2xl leading-none md:text-[32px]"
                    style={{ color: isNewYear ? "var(--fg)" : "transparent" }}
                    /* The repeat is hidden visually but must stay out of the
                       accessibility tree entirely, or a screen reader announces
                       a year that isn't shown. */
                    aria-hidden={!isNewYear}
                  >
                    {m.year}
                  </span>

                  <div>
                    <h3 className="text-[17px] font-semibold md:text-lg">
                      {m.title}
                    </h3>
                    <p
                      className="mt-2 max-w-xl text-[15px] leading-[1.6]"
                      style={{ color: "var(--muted)" }}
                    >
                      {m.body}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
