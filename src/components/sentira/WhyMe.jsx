import { Check, X } from "lucide-react"
import Reveal from "../Reveal"
import { Card, SectionHead } from "./ui"

/**
 * The comparison. A single card split down the middle: the favourable column
 * gets an atmospheric wash behind it, the other stays flat on the card surface.
 *
 * That asymmetry does the persuading, so the two lists are otherwise identical
 * in type, spacing and icon size — the moment the "without" column is also
 * styled down, the whole thing reads as a straw man.
 */

const WITH = [
  "Ships end to end — you get a deployed thing, not a prototype",
  "Reads the existing codebase before adding to it",
  "Real-time and AI work backed by 726+ problems of fundamentals",
  "Writes the docs so the next person isn't stuck",
  "Says when something is the wrong approach",
]

const WITHOUT = [
  "A demo that works once, on one machine",
  "A second architecture bolted beside the first",
  "Libraries pulled in for problems you don't have",
  "Undocumented decisions nobody can revisit",
  "Silent scope creep until the deadline",
]

function Item({ children, positive }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{
          background: positive ? "var(--accent)" : "rgba(255,255,255,0.1)",
          color: positive ? "var(--accent-ink)" : "var(--faint)",
        }}
      >
        {positive ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
      </span>
      <span
        className="text-[15px] leading-[1.55]"
        style={{ color: positive ? "var(--fg)" : "var(--muted)" }}
      >
        {children}
      </span>
    </li>
  )
}

export default function WhyMe() {
  return (
    <section className="relative px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <SectionHead
            className="mb-16"
            label="Why work with me"
            lines={["This is what makes", "the difference."]}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="grid overflow-hidden md:grid-cols-2">
            {/* Favourable column — the wash is a plain gradient rather than an
                image so it costs nothing and never fights the type. */}
            <div
              className="relative p-8 md:p-10"
              style={{
                background:
                  "radial-gradient(120% 130% at 15% 0%, rgba(163,203,61,0.22), rgba(46,70,32,0.14) 45%, transparent 78%)",
              }}
            >
              <h3 className="font-display text-[28px] leading-none md:text-[32px]">
                Working with me
              </h3>
              <ul className="mt-8 flex flex-col gap-4">
                {WITH.map((t) => (
                  <Item key={t} positive>
                    {t}
                  </Item>
                ))}
              </ul>
            </div>

            {/* The divider lives on the second cell so it becomes a horizontal
                rule when the grid stacks, and a vertical one when it doesn't. */}
            <div
              className="border-t p-8 md:border-l md:border-t-0 md:p-10"
              style={{ borderColor: "var(--line)" }}
            >
              <h3
                className="font-display text-[28px] leading-none md:text-[32px]"
                style={{ color: "var(--muted)" }}
              >
                The usual alternative
              </h3>
              <ul className="mt-8 flex flex-col gap-4">
                {WITHOUT.map((t) => (
                  <Item key={t}>{t}</Item>
                ))}
              </ul>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
