import { useEffect, useLayoutEffect, useState } from "react"
import { motion } from "framer-motion"
import GithubReadme, { readmeHeadings } from "./GithubReadme"
import { webpSrcSet } from "./ProjectStage"
import { caseStudies, getCaseStudyById } from "../data/caseStudies"
import { FEATURED_PROJECTS } from "../data/featuredProjects"
import { slugForCaseStudyId, slugForFeaturedId } from "../data/projectSlugs"
import portfolioData from "../data/portfolioData.json"
import { openAssistant } from "../lib/assistantEvents"
import { EASE, DUR } from "../context/ease"
import SoundToggle from "./SoundToggle"

const HOME_TITLE = "Aayush Kumar — Full-Stack Developer & CS Student"

/**
 * Standalone case-study page, served at #/work/:id.
 *
 * The body is still the repository's own README — the one description the
 * owner maintains, and the reason hand-written problem/outcome sections were
 * retired. This page only gives it a frame: a header (title, the one-line
 * summary the home card shows, the cover), a strip of checkable facts (stack,
 * the repo's language and last-updated date from the GitHub sync, collaborator
 * credit where a teammate is named), a contents list built from the README's
 * own sections, and a way on to the next project.
 *
 * Hash routes share one document, so the title and description are swapped
 * per study here and restored on the way out.
 */

const monthYear = (iso) => {
  const d = iso ? new Date(iso) : null
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : null
}

/** Everything the frame shows that isn't the README, from data that can be checked. */
function factsFor(cs) {
  const slug = slugForCaseStudyId(cs.id)
  const featured = FEATURED_PROJECTS.find((p) => slugForFeaturedId(p.id) === slug)
  const repo = cs.links?.github?.toLowerCase()
  const gh = repo ? (portfolioData.github || []).find((r) => r.url?.toLowerCase() === repo) : null
  // Credit only: shown when the entry names a collaborator ("with Kaki Harshita").
  const team = /\b(with|by)\s+\p{Lu}/u.test(cs.role?.teamSize || "") ? cs.role.teamSize : null
  // GitHub's repo "updated" date (any push or metadata change — not a ship
  // date, hence the label). The sync keeps the 12 most recent repos; older
  // ones simply show no date.
  return { slug, lede: featured?.description || null, language: gh?.language || null, updated: monthYear(gh?.updatedAt), team }
}

const scrollToReadme = (slug) => {
  const el = document.getElementById(`readme-${slug}`)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -96 })
  else el.scrollIntoView({ behavior: "smooth", block: "start" })
}

/**
 * The project's cover, or — when it has none or the file fails to load (a
 * placeholder path that was never filled in) — a typographic tile with the
 * name, so the frame never shows a broken image.
 */
function Cover({ src, alt, name, className = "" }) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) {
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={`${className} flex items-center justify-center overflow-hidden`}
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--fg-rgb) / 0.05), transparent 60%), repeating-linear-gradient(0deg, transparent 0 23px, rgb(var(--fg-rgb) / 0.04) 23px 24px), var(--surface)",
        }}
      >
        <span className="px-4 text-center font-display text-[clamp(1.25rem,4vw,3.5rem)] uppercase leading-none tracking-tight" style={{ color: "rgb(var(--fg-rgb) / 0.16)" }}>
          {name}
        </span>
      </div>
    )
  }
  const webp = webpSrcSet(src)
  return (
    <picture>
      {webp && <source type="image/webp" srcSet={webp} sizes="(max-width: 1024px) 92vw, 640px" />}
      <img src={src} alt={alt} decoding="async" className={className} onError={() => setBroken(true)} />
    </picture>
  )
}

export default function CaseStudyPage({ id, onBack }) {
  const caseStudy = getCaseStudyById(id)
  const [headings, setHeadings] = useState([])

  useEffect(() => {
    const desc = document.querySelector('meta[name="description"]')
    const originalDesc = desc?.getAttribute("content")
    if (caseStudy) {
      document.title = `${caseStudy.name} — Aayush Kumar`
      desc?.setAttribute(
        "content",
        `${caseStudy.name}: ${caseStudy.tagline}. A project by Aayush Kumar — stack, source and the repository's own README.`
      )
    } else {
      document.title = "Case study not found — Aayush Kumar"
    }
    return () => {
      document.title = HOME_TITLE
      if (desc && originalDesc != null) desc.setAttribute("content", originalDesc)
    }
  }, [caseStudy])

  // Before paint: a view-transition into this page captures it at the top.
  // Focus moves to the page itself so keyboard and screen-reader users start
  // here rather than on <body> after the route change.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById("main")?.focus({ preventScroll: true })
  }, [id])
  useEffect(() => {
    setHeadings([])
  }, [id])

  if (!caseStudy) {
    return (
      <main
        id="main"
        tabIndex={-1}
        className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 px-6 outline-none"
      >
        <p className="font-mono text-sm text-[var(--muted)]">
          $ cat work/{id || "?"}.md
          <br />
          cat: no such case study
        </p>
        <h1 className="font-display text-4xl uppercase leading-tight md:text-6xl">Case study not found</h1>
        <p className="max-w-md text-[var(--muted)]">There is no project with that id. Here are the ones that exist:</p>
        <nav aria-label="Case studies" className="flex flex-wrap gap-2">
          {caseStudies.map((cs) => (
            <a
              key={cs.id}
              href={`#/work/${cs.id}`}
              className="rounded-full border border-[var(--line)] px-4 py-1.5 font-mono text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {cs.id}
            </a>
          ))}
        </nav>
        <button
          onClick={onBack}
          className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--accent-ink)]"
        >
          ← Back to portfolio
        </button>
      </main>
    )
  }

  const idx = caseStudies.findIndex((cs) => cs.id === caseStudy.id)
  const nn = String(idx + 1).padStart(2, "0")
  const total = String(caseStudies.length).padStart(2, "0")
  const f = factsFor(caseStudy)
  const links = caseStudy.links || {}
  // Only facts that exist: an empty "—" cell reads as broken, not as modest.
  const facts = [
    ["Stack", (caseStudy.tags || []).join(" · ")],
    ["Language", f.language],
    ["Repo updated", f.updated],
    ["Team", f.team],
    ["Source", links.github && !f.team ? "Public on GitHub" : null],
  ].filter(([, v]) => v)
  const factCols = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5" }
  const rise = (delay) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DUR.enter, delay, ease: EASE.ENTER },
  })

  return (
    <main id="main" tabIndex={-1} className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-24 outline-none md:px-10 2xl:max-w-[80rem]">
      {/* Rail: back, position in the work, file */}
      <motion.nav
        aria-label="Breadcrumb"
        {...rise(0)}
        className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] md:gap-4"
        style={{ color: "var(--muted)" }}
      >
        <button onClick={onBack} className="group inline-flex items-center gap-2 normal-case tracking-[0.08em] transition-colors hover:text-[var(--accent)]">
          <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
          cd ~/projects
        </button>
        <span aria-hidden="true" className="h-px flex-1" style={{ background: "var(--line)" }} />
        <span style={{ color: "var(--accent)" }}>
          {nn} / {total}
        </span>
        <span aria-hidden="true" className="hidden h-px w-10 sm:block" style={{ background: "var(--line)" }} />
        <span className="hidden normal-case tracking-[0.08em] sm:inline">~/work/{caseStudy.id}.md</span>
        {/* Phones have no dock: the sound switch rides on the rail */}
        <SoundToggle className="md:hidden" />
      </motion.nav>

      {/* Header: title, summary, actions | cover */}
      <header className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-end lg:gap-14">
        <motion.div {...rise(0.06)} className="min-w-0 lg:col-span-6">
          {caseStudy.badge && (
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>
              {caseStudy.badge}
            </p>
          )}
          <h1 id="case-study-title" className="break-words font-display uppercase leading-[0.9] tracking-tight text-[clamp(2.75rem,4.6vw,5rem)]">
            {caseStudy.name}
          </h1>
          {f.lede && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: "var(--muted)" }}>
              {f.lede}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {links.demo && (
              <a
                href={links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--accent-ink)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                Live demo ↗
              </a>
            )}
            {links.github && (
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-[var(--fg)]"
                style={{ borderColor: "var(--line)" }}
              >
                Source ↗
              </a>
            )}
            {f.slug && (
              <button
                type="button"
                onClick={() => openAssistant({ projectSlug: f.slug })}
                className="link-underline font-mono text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-[var(--fg)]"
                style={{ color: "var(--muted)" }}
              >
                Ask about this project
              </button>
            )}
          </div>
          {!links.demo && links.demo_note && (
            <p className="mt-4 font-mono text-[11px]" style={{ color: "var(--muted)" }}>
              {links.demo_note}
            </p>
          )}
          {links.demo && links.demo_note && (
            <p className="mt-4 max-w-md font-mono text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Note: {links.demo_note.charAt(0).toLowerCase() + links.demo_note.slice(1)}.
            </p>
          )}
        </motion.div>

        <motion.figure {...rise(0.14)} className="min-w-0 lg:col-span-6">
          <div
            data-vt="case-cover"
            className="relative overflow-hidden rounded-xl border"
            style={{ borderColor: "var(--line)", background: "var(--surface)", viewTransitionName: "project-cover" }}
          >
            <Cover key={caseStudy.id} src={caseStudy.cover} name={caseStudy.name} alt={`${caseStudy.name} — cover`} className="aspect-[16/10] w-full object-cover" />
          </div>
          <figcaption className="mt-4 flex justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
            <span>fig. {nn}</span>
            <span className="truncate">{caseStudy.name}</span>
          </figcaption>
        </motion.figure>
      </header>

      {/* Facts on a rule */}
      <motion.dl {...rise(0.22)} className={`mt-14 grid grid-cols-2 border-y ${factCols[facts.length]}`} style={{ borderColor: "var(--line)" }}>
        {facts.map(([label, value], i) => (
          <div
            key={label}
            className={`flex flex-col-reverse gap-2 py-5 ${i % 2 ? "border-l pl-4" : "pr-4"} md:px-6 ${i === 0 ? "md:pl-0" : "md:border-l"}`}
            style={{ borderColor: "var(--line)" }}
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
              {label}
            </dt>
            <dd className="text-sm leading-snug md:text-[15px]" style={{ color: "var(--fg)" }}>
              {value}
            </dd>
          </div>
        ))}
      </motion.dl>

      {/* README with its own contents list */}
      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-28">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
              README.md <span style={{ color: "var(--accent)" }}>· live from GitHub</span>
            </p>
            {headings.length > 0 && (
              <nav aria-label="README sections" className="mt-6 border-t" style={{ borderColor: "var(--line)" }}>
                {headings.slice(0, 14).map((h) => (
                  <button
                    key={h.slug}
                    type="button"
                    onClick={() => scrollToReadme(h.slug)}
                    className="block w-full border-b py-2.5 text-left text-[13px] transition-colors hover:text-[var(--accent)]"
                    style={{ borderColor: "var(--line)", color: "var(--muted)" }}
                  >
                    {h.text}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </aside>
        <section aria-labelledby="readme-label" className="min-w-0 lg:col-span-9">
          <h2 id="readme-label" className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] lg:sr-only" style={{ color: "var(--muted)" }}>
            README.md · live from GitHub
          </h2>
          <div className="max-w-[74ch]">
            <GithubReadme
              repoUrl={links.github}
              fallback={caseStudy.tagline}
              article
              onMarkdown={(md) => setHeadings(readmeHeadings(md))}
            />
          </div>
        </section>
      </div>

      <NextUp idx={idx} />
    </main>
  )
}

/** Previous / next, as covers: keep readers moving through the work. */
function NextUp({ idx }) {
  const n = caseStudies.length
  const items = [
    { cs: caseStudies[(idx - 1 + n) % n], label: "← Previous" },
    { cs: caseStudies[(idx + 1) % n], label: "Next →" },
  ]
  return (
    <nav aria-label="More case studies" className="mt-24 grid grid-cols-1 gap-6 border-t pt-10 sm:grid-cols-2" style={{ borderColor: "var(--line)" }}>
      {items.map(({ cs, label }, i) => (
        <a key={label} href={`#/work/${cs.id}`} className={`group flex min-w-0 items-center gap-5 ${i ? "sm:flex-row-reverse sm:text-right" : ""}`}>
          <div className="w-28 shrink-0 overflow-hidden rounded-lg border md:w-40" style={{ borderColor: "var(--line)" }}>
            <Cover key={cs.id} src={cs.cover} name={cs.name} alt="" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
              {label}
            </span>
            <p className="mt-1 truncate font-display text-2xl uppercase transition-colors group-hover:text-[var(--accent)] md:text-3xl">{cs.name}</p>
          </div>
        </a>
      ))}
    </nav>
  )
}
