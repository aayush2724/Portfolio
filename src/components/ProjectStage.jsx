import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLowPower } from "../context/motion"
import { openAssistant } from "../lib/assistantEvents"
import { slugForFeaturedId } from "../data/projectSlugs"

/**
 * One project at a time on a lit stage, instead of a rail of cards.
 *
 * The idea is borrowed from the Sentira template: the panel behind the artwork
 * is a blown-up, blurred copy of the artwork itself, so every project repaints
 * the whole stage in its own colour. That is what lets a 16:9 screenshot fill a
 * wide panel without being stretched to fit it — and it is the reason this reads
 * as a stage rather than as a bigger card.
 *
 * Everything else is this site's own register: Clash Display caps, the lime
 * accent, mono metadata.
 */

/**
 * "/auralis-800.jpg" -> "/auralis-400.webp" for the responsive <source>.
 * Returns null for covers with no raster variant (the SVGs), so we don't
 * advertise an SVG as image/webp and hand the browser an undecodable source.
 */
export function webpSrcSet(src) {
  if (!/-800\.(jpg|jpeg|png)$/i.test(src)) return null
  const at = (w) => src.replace(/-800\.(jpg|jpeg|png)$/i, `-${w}.webp`)
  return `${at(400)} 400w, ${at(800)} 800w`
}

function gradientFrom(earthy) {
  const c = earthy?.match(/#(?:[0-9a-fA-F]{3}){1,2}/g) || []
  return `linear-gradient(135deg, ${c[0] || "#1f2937"} 0%, ${c[1] || "#000000"} 100%)`
}

const slide = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 70 : -70, scale: 0.97 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -70 : 70, scale: 0.97 }),
}

export default function ProjectStage({
  project,
  index,
  total,
  direction,
  onStep,
  onViewDescription,
  onViewDemo,
}) {
  const lowPower = useLowPower()
  const hasImage = project.image && project.image !== ""

  // Arrow keys move the deck. The stage is the only horizontally-paged thing on
  // the page, so binding at window level costs nothing and saves the visitor
  // having to tab to a control first.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
      // Leave the keys alone while someone is typing (the shell, the bot) or a
      // dialog is open above the stage — moving the caret must not page the deck.
      const t = e.target
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (document.querySelector('[aria-modal="true"]')) return
      onStep(e.key === "ArrowLeft" ? -1 : 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onStep])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      {/* Halo. Scaled past its box so the blur has no visible edge, and keyed on
          the project so it crossfades rather than cutting. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`halo-${project.id}`}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: lowPower ? 0.4 : 0.55 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
          style={
            hasImage
              ? {
                  backgroundImage: `url(${project.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  /* A 46px gaussian over a full-bleed bitmap is the single
                     priciest thing here; phones get a cheaper blur on a smaller
                     source. */
                  filter: lowPower ? "blur(24px)" : "blur(46px) saturate(1.3)",
                  transform: "scale(1.35)",
                }
              : { background: gradientFrom(project.earthy) }
          }
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[#060608]/55" />

      {/* Drag to page on touch, where there are no arrow buttons in reach. */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.14}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70) onStep(1)
          else if (info.offset.x > 70) onStep(-1)
        }}
        data-cursor="Drag"
        className="relative flex h-full w-full items-center px-3 py-3 md:px-10 md:py-8"
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {/* Spec sheet + artwork, side by side: the words get their own
              column instead of being printed over a screenshot that already
              has a headline of its own. */}
          <motion.div
            key={project.id}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto flex h-full w-full max-w-[1100px] flex-col justify-center gap-4 md:gap-6 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-10"
          >
            {/* Artwork first in the DOM order (it leads the stacked card on
                phones and tablets); from lg it moves to the right column. On
                tablets its height is capped so the stack fits the stage. */}
            <motion.button
              type="button"
              /* Shared-element source for CaseStudyModal — it animates from this
                 exact frame, so the id has to sit on the visible artwork. */
              layoutId={`project-card-${project.id}`}
              onClick={() => onViewDescription(project)}
              aria-label={`Open the case study for ${project.title}`}
              className="group relative aspect-[16/10] w-full shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/10 text-left md:aspect-auto md:h-[46%] lg:order-2 lg:h-auto lg:aspect-[16/10]"
              // Morphs into the case-study page's cover (see openCaseStudy).
              style={{ viewTransitionName: "project-cover" }}
            >
              {hasImage ? (
                <picture>
                  {webpSrcSet(project.image) && (
                    <source type="image/webp" srcSet={webpSrcSet(project.image)} sizes="(max-width: 1024px) 92vw, 640px" />
                  )}
                  <img
                    src={project.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                  />
                </picture>
              ) : (
                <div className="absolute inset-0" style={{ background: gradientFrom(project.earthy) }} />
              )}
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                Case study ↗
              </span>
            </motion.button>

            <div className="flex min-h-0 min-w-0 flex-col lg:order-1">
              <div className="flex min-w-0 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 md:text-[11px]">
                <span style={{ color: "var(--accent)" }}>
                  {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                <span aria-hidden="true" className="h-px w-6 bg-white/15" />
                <span className="truncate">{project.badge}</span>
              </div>
              <h3 className="mt-2 font-display text-3xl uppercase leading-[0.95] tracking-tight text-white md:mt-3 md:text-4xl lg:mt-4 xl:text-5xl 2xl:text-6xl">
                {project.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/65 md:mt-3 md:text-[15px] lg:mt-4 lg:line-clamp-5">
                {project.description}
              </p>
              <p className="mt-3 hidden font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-white/45 lg:block">
                {project.tags.join(" · ")}
              </p>

              {/* One primary action, two quiet ones; the row wraps rather
                  than spilling out of a narrow column. */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-7">
                <button
                  onClick={() => onViewDemo(project)}
                  aria-label={`Open the live demo of ${project.title}`}
                  className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-ink)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Live demo ↗
                </button>
                <button
                  onClick={() => onViewDescription(project)}
                  aria-label={`Read the description of ${project.title}`}
                  className="link-underline font-mono text-[11px] uppercase tracking-[0.16em] text-white/75 transition-colors hover:text-white"
                >
                  Description →
                </button>
                <button
                  onClick={() => openAssistant({ projectSlug: slugForFeaturedId(project.id) })}
                  aria-label={`Ask the assistant about ${project.title}`}
                  className="link-underline font-mono text-[11px] uppercase tracking-[0.16em] text-white/75 transition-colors hover:text-white"
                >
                  Ask AI
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
