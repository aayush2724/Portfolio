import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLowPower } from "../context/motion"

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
function webpSrcSet(src) {
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

/** The faded neighbour numbers at the panel's edges. */
function Peek({ n, side }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 select-none font-display text-[52px] leading-none tracking-tighter text-white/20 lg:block ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      {n}
    </span>
  )
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
  const label = (i) => String(((i % total) + total) % total + 1).padStart(2, "0")

  // Arrow keys move the deck. The stage is the only horizontally-paged thing on
  // the page, so binding at window level costs nothing and saves the visitor
  // having to tab to a control first.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") onStep(-1)
      else if (e.key === "ArrowRight") onStep(1)
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
      <div className="absolute inset-0 bg-[#080808]/55" />

      <Peek n={label(index - 1)} side="left" />
      <Peek n={label(index + 1)} side="right" />

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
        className="relative flex h-full w-full flex-col items-center justify-center gap-4 px-4 py-4 md:gap-5 md:px-10"
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.article
            key={project.id}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            /* Shared-element source for CaseStudyModal — it animates from this
               exact frame, so the id has to sit on the visible artwork. */
            layoutId={`project-card-${project.id}`}
            onClick={() => onViewDescription(project)}
            className="group relative w-full max-w-[720px] flex-1 cursor-pointer overflow-hidden rounded-2xl border border-white/10"
          >
            {hasImage ? (
              <picture>
                {webpSrcSet(project.image) && (
                  <source
                    type="image/webp"
                    srcSet={webpSrcSet(project.image)}
                    sizes="(max-width: 768px) 92vw, 720px"
                  />
                )}
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </picture>
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: gradientFrom(project.earthy) }}
              />
            )}

            {/* Two scrims rather than one: the top carries the title block and
                the bottom carries the tags, and a single full-height gradient
                would wash out the middle of the screenshot. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.15) 38%, rgba(8,8,8,0.12) 56%, rgba(8,8,8,0.9) 100%)",
              }}
            />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 md:p-7">
              <div>
                <h3 className="font-display text-3xl uppercase leading-none tracking-tighter text-white drop-shadow-lg md:text-5xl">
                  {project.title}
                </h3>
                <p className="mt-3 max-w-sm text-[13px] font-medium leading-relaxed text-white/70 line-clamp-3 md:text-sm">
                  {project.description}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] tracking-widest text-white/40">
                {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/75"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="shrink-0 text-right font-display text-sm uppercase leading-none tracking-tight text-[var(--accent)] md:text-lg">
                {project.badge}
              </span>
            </div>
          </motion.article>
        </AnimatePresence>

        {/* Actions sit outside the artwork so the shared-element hop into the
            modal isn't carrying two buttons along with it. */}
        <div className="flex w-full max-w-[720px] shrink-0 gap-3">
          <button
            onClick={() => onViewDescription(project)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] py-2.5 text-[11px] font-bold uppercase tracking-widest text-white/85 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.13]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Description
          </button>
          <button
            onClick={() => onViewDemo(project)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, rgba(212,255,63,0.18), rgba(150,255,63,0.08))",
              border: "1px solid rgba(212,255,63,0.4)",
              color: "rgba(212,255,63,0.95)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Live Demo
          </button>
        </div>
      </motion.div>
    </div>
  )
}
