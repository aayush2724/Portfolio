import { Html } from "@react-three/drei"
import { HOTSPOTS } from "./stations"

/**
 * Clickable markers floating on each door. They render into a DOM layer
 * above the page (so the empty "hq" section can't swallow the click) and
 * only accept pointer events while that section is the active scene.
 */
export default function Hotspots({ portal, active, hoverRef, hoverId, onGo }) {
  return HOTSPOTS.map((h) => (
    <Html key={h.id} position={h.at} portal={portal} center zIndexRange={[20, 20]} style={{ pointerEvents: "none" }}>
      <button
        type="button"
        tabIndex={active ? 0 : -1}
        aria-label={`Open ${h.label} (${h.hint})`}
        onClick={() => onGo(h.id)}
        onMouseEnter={() => (hoverRef.current = h.id)}
        onMouseLeave={() => (hoverRef.current = null)}
        onPointerDown={(e) => e.stopPropagation()}
        onFocus={() => (hoverRef.current = h.id)}
        onBlur={() => (hoverRef.current = null)}
        className="group flex items-center gap-2 whitespace-nowrap rounded-full border py-1 pl-1 pr-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 hover:border-accent focus-visible:border-accent"
        style={{
          pointerEvents: active ? "auto" : "none",
          borderColor: hoverId === h.id ? "var(--accent)" : "var(--line)",
          color: hoverId === h.id ? "var(--accent)" : "var(--fg)",
          background: "rgb(var(--bg-rgb) / 0.72)",
          backdropFilter: "blur(6px)",
        }}
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          <span className="absolute inset-0 rounded-full opacity-40 group-hover:animate-ping" style={{ background: "var(--accent)" }} />
          <span className="relative h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
        </span>
        <span>{h.label}</span>
        <span className="hidden group-hover:inline" style={{ color: "var(--muted)" }}>
          · {h.hint}
        </span>
      </button>
    </Html>
  ))
}
