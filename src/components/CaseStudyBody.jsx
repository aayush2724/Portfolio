import GithubReadme from "./GithubReadme"

/**
 * The project description — factual header plus the repo's real README.
 *
 * Earlier versions rendered hand-written case-study sections (problem,
 * metrics, outcomes) from caseStudies.js. Those read well but weren't backed
 * by the repos, so the body is now the README itself: the one description the
 * owner actually maintains. The header keeps only verifiable data — name,
 * tags, links.
 *
 * Accepts either a caseStudies.js entry or a raw PROJECTS entry from
 * ProjectsBold (projects like Auralis have no case study yet); `normalize`
 * maps both shapes to one.
 */
function normalize(item) {
  return {
    name: item.name || item.title || "",
    badge: item.badge || null,
    tagline: item.tagline || item.description || "",
    tags: item.tags || [],
    github: item.links?.github || item.link || null,
    demo: item.links?.demo || item.demo || null,
    demoNote: item.links?.demo_note || null,
  }
}

export default function CaseStudyBody({ caseStudy }) {
  if (!caseStudy) return null
  const p = normalize(caseStudy)

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            {p.name}
          </h2>
          {p.badge && (
            <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs font-mono text-[var(--accent)]">
              {p.badge}
            </span>
          )}
        </div>
        {/* No tagline here: several caseStudies.js taglines have drifted from
            what the repos actually are (DeskGuard's said "workspace security"
            while its README says seat booking). The README's own first
            paragraph is the description; the tagline survives only as the
            fallback text when the README can't be fetched. */}

        {/* Tags */}
        {p.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {p.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-md border border-[var(--line)] bg-[var(--surface)]/50 px-2.5 py-1 text-xs font-mono text-[var(--muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {p.github && (
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View Source
            </a>
          )}
          {p.demo && (
            <a
              href={p.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-ink)] transition-all duration-300 hover:bg-[var(--accent)]/90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
              Live Demo
            </a>
          )}
          {!p.demo && p.demoNote && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/50 px-5 py-2.5 text-xs text-[var(--muted)] italic">
              {p.demoNote}
            </span>
          )}
        </div>
      </div>

      {/* The repo's own README — the description the code actually backs up */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h3 className="font-display text-2xl uppercase text-[var(--accent)]">
            README.md
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
            live from GitHub
          </span>
        </div>
        <GithubReadme repoUrl={p.github} fallback={p.tagline} />
      </section>
    </>
  )
}
