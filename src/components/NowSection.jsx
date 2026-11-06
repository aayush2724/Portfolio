import { useRef } from "react"
import { useInView } from "framer-motion"
import Reveal, { Stagger, StaggerItem } from "./Reveal"
import CommandLabel from "./CommandLabel"
import AnimatedHeading from "./AnimatedHeading"
import { renderMarkdown } from "./GithubReadme"
import { NOW, POSTS } from "../data/posts"
import { formatDate } from "../data/content"
import { useNowPlaying } from "../context/useNowPlaying"
import { formatRelative } from "../data/nowPlaying"
import { safeImageSrc } from "../lib/safeUrl"

/**
 * Now — what I'm doing at the moment, from src/content/now.md, plus the
 * latest blog posts. Each `## Heading` in now.md becomes a card. The
 * Listening card is live: it shows the Last.fm track the Beyond Code card
 * shows, and its now.md text only when nothing has been scrobbled.
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

/** The Listening card: live track from Last.fm, or the now.md text as fallback. */
function ListeningCard({ section }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: "200px 0px" })
  const { track } = useNowPlaying({ active: inView })
  const art = track?.art ? safeImageSrc(track.art) : null
  const live = Boolean(track?.nowPlaying)
  return (
    <div ref={ref} className="h-full">
      <NowCard title={section.title}>
        {track ? (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl text-xl" style={{ background: "rgb(var(--accent-rgb) / 0.1)" }}>
              {art ? <img src={art} alt="" width={48} height={48} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : "🎵"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium" style={{ color: "var(--fg)" }}>
                {track.title}
              </p>
              <p className="truncate text-sm" style={{ color: "var(--muted)" }}>
                {track.artist}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: live ? "var(--accent)" : "var(--muted)" }}>
                {live ? "playing now" : track.playedAt ? `last played · ${formatRelative(track.playedAt)}` : "last played"} · last.fm
              </p>
            </div>
          </div>
        ) : (
          <div className="now-card">{renderMarkdown(section.body, MD_CTX)}</div>
        )}
      </NowCard>
    </div>
  )
}

export default function NowSection() {
  const latest = POSTS.slice(0, 3)
  return (
    <section id="now" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl 2xl:max-w-[88vw]">
        <Reveal>
          <CommandLabel className="mb-6">cat now.md</CommandLabel>
        </Reveal>

        <Reveal>
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--accent)" }}>
                Right now
              </p>
              <AnimatedHeading text="Now" as="h2" className="font-display text-5xl uppercase leading-none md:text-7xl" />
            </div>
            <p className="max-w-xl text-sm leading-relaxed md:text-base" style={{ color: "var(--muted)" }}>
              What I'm actually doing at the moment, not a bio.{" "}
              <span className="font-mono text-xs uppercase tracking-widest">updated {formatDate(NOW.updated)}</span>
            </p>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {NOW.sections.map((s) => (
            <StaggerItem key={s.title}>
              {/^listening$/i.test(s.title) ? (
                <ListeningCard section={s} />
              ) : (
                <NowCard title={s.title}>
                  <div className="now-card">{renderMarkdown(s.body, MD_CTX)}</div>
                </NowCard>
              )}
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
