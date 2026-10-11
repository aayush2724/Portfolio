import { useLowPower } from "../context/motion"
import { HOTSPOTS } from "../three/stations"

/**
 * The map moment. On desktop the section is an empty screen: the page content
 * steps aside and the 3D cabin behind it (CinemaStage) shows every door with a
 * clickable marker. Low-power devices never mount the canvas, so they get the
 * same map as a plain list of doors.
 */
export default function CabinMap() {
  const lowPower = useLowPower()

  if (lowPower) {
    return (
      <section id="hq" className="relative py-24 px-6 md:px-16">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
            Aayush HQ
          </p>
          <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>
            Every page lives somewhere in here.
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {HOTSPOTS.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className="flex flex-col gap-1 rounded-2xl border px-4 py-3 transition-colors hover:border-accent"
                  style={{ borderColor: "var(--line)", background: "var(--surface)" }}
                >
                  <span className="font-display text-base">{h.label}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                    {h.hint}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  return (
    <section id="hq" className="relative h-screen" aria-label="HQ: a 3D map of every page">
      <div className="pointer-events-none absolute inset-x-0 top-28 flex flex-col items-center gap-2 px-6 text-center">
        <p className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: "var(--accent)" }}>
          Aayush HQ
        </p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Every page lives somewhere in here. Drag to look around; click an object or its light to open it.
        </p>
      </div>
      {/* Keyboard and screen-reader route to the same doors */}
      <ul className="sr-only">
        {HOTSPOTS.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`}>
              {h.label} — {h.hint}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
