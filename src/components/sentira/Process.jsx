import Reveal, { Stagger, StaggerItem } from "../Reveal"
import { Card, SectionHead, Tag } from "./ui"

/**
 * Three steps, each a card whose only content is an oversized gradient disc
 * with the step number knocked into it — the title and copy sit *below* the
 * card, not inside it.
 *
 * Putting the text outside is what stops this from becoming a third variant of
 * the service rows: the discs form their own rhythm across the row, and the
 * captions read as a separate line of type under them.
 */

const STEPS = [
  {
    n: "01",
    title: "Understand the problem",
    when: "Week 1",
    body: "I start by finding out what actually hurts — the workflow, the constraint, the thing everyone works around. Half of what gets requested isn't what's needed.",
    /* Each disc gets its own hue so the row reads as a sequence rather than a
       repeated motif; they are the only non-green colour on the page. */
    from: "#b39ddb",
    to: "#7c5cd6",
  },
  {
    n: "02",
    title: "Build it in the open",
    when: "Weeks 2–4",
    body: "Small, working slices you can look at, not a reveal at the end. Typed front end, tested services, and deploys from day one so nothing waits on a big-bang launch.",
    from: "#a9bd7a",
    to: "#5f7f3f",
  },
  {
    n: "03",
    title: "Ship, then keep it alive",
    when: "Ongoing",
    body: "Shipping is the midpoint. Monitoring, the follow-up fixes and the docs that let someone else pick it up are what decide whether it's still running in six months.",
    from: "#8fb6d9",
    to: "#4571a0",
  },
]

export default function Process() {
  return (
    <section id="process" className="relative px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <SectionHead
            className="mb-16"
            label="How I work"
            lines={["Getting real results", "without the guesswork."]}
          />
        </Reveal>

        <Stagger className="grid gap-x-4 gap-y-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <StaggerItem key={s.n}>
              <Card className="flex aspect-[4/3] items-center justify-center overflow-hidden">
                <div
                  className="flex aspect-square w-[46%] items-center justify-center rounded-full"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 20%, ${s.from}, ${s.to})`,
                  }}
                >
                  <span
                    className="font-display text-[44px] leading-none md:text-[52px]"
                    style={{ color: "rgba(255,255,255,0.82)" }}
                  >
                    {s.n}
                  </span>
                </div>
              </Card>

              <div className="mt-6 text-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <h3 className="text-[17px] font-semibold">{s.title}</h3>
                  <Tag>{s.when}</Tag>
                </div>
                <p
                  className="mx-auto mt-3 max-w-[19rem] text-sm leading-[1.6]"
                  style={{ color: "var(--muted)" }}
                >
                  {s.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
