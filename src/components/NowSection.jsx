import Reveal, { Stagger, StaggerItem } from "./Reveal"
import SectionHead from "./SectionHead"
import { renderMarkdown } from "./GithubReadme"
import { NOW, POSTS } from "../data/posts"
import { formatDate } from "../data/content"

/**
 * Now — what I'm doing at the moment, from src/content/now.md, plus the
 * latest blog posts. Each `## Heading` in now.md becomes a card, except
 * Listening: the live Last.fm card is Beyond Code's, and showing it twice
 * made two sections do one job.
 */

const CARD_STYLE = { borderColor: "var(--line)", background: "rgba(255,255,255,0.02)" }
export const SITE = "https://aayush-2724.vercel.app/"
export const MD_CTX = { base: SITE, headingShift: 0 }

/** Hash-route link that works whether or not a smooth-scroll library owns anchor clicks. */
export function RouteLink({ to, className, children }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        window.location.hash = to
      }}
    >
      {children}
    </a>
  )
}

function NowCard({ title, children }) {
  return (
    <div className="h-full rounded-3xl border p-6 transition-colors duration-300 hover:border-[var(--accent)]" style={CARD_STYLE}>
      <h3 className="mb-3 font-display text-xl" style={{ color: "var(--fg)" }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function NowSection() {
  const latest = POSTS.slice(0, 3)
  return (
    <section id="now" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl 2xl:max-w-[88vw]">
        <SectionHead
          id="now"
          path="~/now.md"
          meta={`updated ${formatDate(NOW.updated)}`}
          metaOnPhones
          title="Now"
          aside="What I'm actually doing at the moment, not a bio."
        />

        {/* Listening is left out here: the live card lives in Beyond Code (#life). */}
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {NOW.sections
            .filter((s) => !/^listening$/i.test(s.title))
            .map((s) => (
              <StaggerItem key={s.title}>
                <NowCard title={s.title}>
                  <div className="now-card">{renderMarkdown(s.body, MD_CTX)}</div>
                </NowCard>
              </StaggerItem>
            ))}
        </Stagger>

        {latest.length > 0 && (
          <Reveal>
            <div className="mt-6 rounded-3xl border p-6 md:p-8" style={CARD_STYLE}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <h3 className="font-display text-2xl uppercase" style={{ color: "var(--fg)" }}>
                  Short posts
                </h3>
                <RouteLink
                  to="#/blog"
                  className="font-mono text-xs uppercase tracking-widest transition-colors hover:text-[var(--accent)]"
                >
                  <span style={{ color: "var(--muted)" }}>all posts →</span>
                </RouteLink>
              </div>
              <ol className="divide-y divide-[var(--line)]">
                {latest.map((p) => (
                  <li key={p.slug}>
                    <RouteLink to={`#/blog/${p.slug}`} className="group flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:gap-6">
                      <span className="flex-shrink-0 font-mono text-xs md:w-28" style={{ color: "var(--muted)" }}>
                        {formatDate(p.date)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg transition-colors group-hover:text-[var(--accent)]" style={{ color: "var(--fg)" }}>
                          {p.title}
                        </span>
                        <span className="block text-sm" style={{ color: "var(--muted)" }}>
                          {p.summary}
                        </span>
                      </span>
                      <span className="font-mono text-xs" style={{ color: "var(--muted)" }}>
                        {p.minutes} min
                      </span>
                    </RouteLink>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
