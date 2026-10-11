import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import Cabin from "../three/Cabin"
import Hotspots from "../three/Hotspots"
import Dust from "../three/Dust"
import Rig from "../three/Rig"
import { tokenColor } from "../three/tokens"
import { useSectionTracker } from "../three/useSectionTracker"
import { SCENE_LABELS, HOTSPOTS } from "../three/stations"

/**
 * The cabin behind the whole page: one WebGL canvas, fixed between the flat
 * background and the fog. The page is a walk through the room — each section
 * is a place in it (src/three/stations.js) and the camera eases there as the
 * section takes the viewport. The "hq" section is the map: the page
 * content steps aside and the doors to every page become clickable.
 *
 * Desktop only (see CinemaBackground); low-power devices keep the CSS grid.
 */
function Hud({ scene }) {
  const label = SCENE_LABELS[scene.id] || scene.id
  const n = String(scene.index + 1).padStart(2, "0")
  const total = String(scene.count).padStart(2, "0")
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase transition-opacity duration-500"
      style={{ color: "var(--muted)", opacity: scene.id === "hero" ? 0 : 1 }}
    >
      <span style={{ color: "var(--accent)" }}>●</span>
      <span>
        Scene {n} / {total}
      </span>
      <span style={{ color: "var(--fg)" }}>{label}</span>
    </div>
  )
}

/** Jump to a section with no animation (the cut hides the jump). */
function jumpTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = window.__lenis
  if (lenis) lenis.scrollTo(el, { immediate: true, force: true })
  else el.scrollIntoView({ behavior: "instant" })
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/** Cut timing (ms): fly to the object, dip to dark, hold while the page lands, rise. */
const CUT = { fly: 650, dip: 300, hold: 260, rise: 420 }

export default function CinemaStage() {
  const { store, scene } = useSectionTracker()
  const mouse = useRef({ x: 0, y: 0 })
  const hover = useRef(null)
  const portal = useRef(null)
  const stage = useRef(null)
  const orbit = useRef({ active: false, yaw: 0, pitch: 0, dragging: false, moved: 0, lastX: 0, lastY: 0 })
  const [hoverId, setHoverId] = useState(null)
  const fly = useRef(null)
  const cutting = useRef(false)
  const [veil, setVeil] = useState(false)
  const [inCut, setInCut] = useState(false)
  const [loop, setLoop] = useState("never")
  const onReady = useCallback(() => setLoop("always"), [])
  const accent = useMemo(() => tokenColor("--accent-rgb", "#d4ff3f"), [])
  const mapActive = scene.id === "hq" && scene.settled && !inCut
  orbit.current.active = mapActive

  /**
   * The cut. From the map: the camera flies to the door's station while the
   * room stays lit, the screen dips to dark, the page lands on the section
   * with no scroll animation, and the screen rises on it. Back to the map
   * (any link to #hq) runs the same dip with the fly hidden behind it.
   * Scrolling is locked for the second it takes.
   */
  const cutTo = useCallback(async (id, fromMap) => {
    if (cutting.current) return
    cutting.current = true
    setInCut(true)
    const lenis = window.__lenis
    lenis?.stop()
    try {
      if (fromMap) {
        fly.current = { id, lit: true }
        await wait(CUT.fly)
      }
      setVeil(true)
      await wait(CUT.dip)
      if (!fromMap) fly.current = { id, lit: id === "hq" }
      jumpTo(id)
      await wait(CUT.hold)
      fly.current = null
      setVeil(false)
      await wait(CUT.rise)
    } finally {
      lenis?.start()
      cutting.current = false
      setInCut(false)
    }
  }, [])

  const onGo = useCallback(
    (id) => {
      // A drag that ends over a door is not a click.
      if (orbit.current.moved > 6) return
      setHoverId(null)
      window.dispatchEvent(new CustomEvent("cursor-label", { detail: "" }))
      cutTo(id, true)
    },
    [cutTo]
  )

  // Links back to the map (the nav's "Cabin") take the cut instead of a
  // long smooth scroll through every section.
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest?.('a[href="#hq"]')
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      if (store.current.id === "hq") return
      e.preventDefault()
      cutTo("hq", false)
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [cutTo, store])

  // Hovering a door in the room: light it, highlight its marker, and put its
  // name on the cursor.
  const onHover = useCallback((id) => {
    hover.current = id
    setHoverId(id)
    const h = id && HOTSPOTS.find((x) => x.id === id)
    window.dispatchEvent(new CustomEvent("cursor-label", { detail: h ? h.label : "" }))
  }, [])

  // Drag to look around the map.
  const onPointerDown = (e) => {
    if (!mapActive || e.button !== 0) return
    const o = orbit.current
    o.dragging = true
    o.moved = 0
    o.lastX = e.clientX
    o.lastY = e.clientY
  }
  const onPointerMove = (e) => {
    const o = orbit.current
    if (!o.dragging) return
    const dx = e.clientX - o.lastX
    const dy = e.clientY - o.lastY
    o.lastX = e.clientX
    o.lastY = e.clientY
    o.moved += Math.abs(dx) + Math.abs(dy)
    o.yaw = Math.max(-0.45, Math.min(0.45, o.yaw - dx * 0.0022))
    o.pitch = Math.max(-0.12, Math.min(0.22, o.pitch + dy * 0.0012))
  }
  const onPointerUp = () => {
    orbit.current.dragging = false
  }

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <>
      {/* While the map is active the stage rises above the page and takes
          the pointer, so the room's objects are hoverable and draggable. */}
      <div
        ref={stage}
        aria-hidden="true"
        className={`fixed inset-0 select-none ${mapActive ? "z-20 pointer-events-auto" : "z-[1] pointer-events-none"}`}
        style={{ opacity: 0 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <Canvas
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
          camera={{ fov: 50, near: 0.1, far: 40, position: [0, 1.75, 3] }}
          frameloop={loop}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
          style={{ width: "100%", height: "100%" }}
        >
          <fogExp2 attach="fog" args={["#09090b", 0.045]} />
          <ambientLight intensity={0.85} />
          <hemisphereLight args={["#2a3040", "#0a0a0b", 1.1]} />
          <Rig tracker={store} mouse={mouse} orbit={orbit} fly={fly} dimEl={stage} onReady={onReady} />
          <Cabin hoverRef={hover} accent={accent} onHover={onHover} onOpen={onGo} />
          <Dust tracker={store} accent={accent} />
          <Hotspots portal={portal} active={mapActive} hoverRef={hover} hoverId={hoverId} onGo={onGo} />
        </Canvas>
      </div>
      {/* Marker layer: above the page so the empty map section can't swallow clicks */}
      <div
        ref={portal}
        className="pointer-events-none fixed inset-0 z-20 overflow-hidden transition-opacity duration-[900ms]"
        style={{ opacity: mapActive ? 1 : 0 }}
      />
      {/* The dip to dark that hides the page jump inside a cut */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] transition-opacity ease-in-out"
        style={{ background: "var(--bg)", opacity: veil ? 1 : 0, transitionDuration: `${veil ? CUT.dip : CUT.rise}ms` }}
      />
      <Hud scene={scene} />
    </>
  )
}
