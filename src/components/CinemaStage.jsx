import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import Cabin from "../three/Cabin"
import Hotspots from "../three/Hotspots"
import Facing from "../three/Facing"
import Dust from "../three/Dust"
import Rig, { Pulse } from "../three/Rig"
import FilmLights, { DOOR_GLOW } from "../three/FilmLights"
import { tokenColor } from "../three/tokens"
import { useSectionTracker } from "../three/useSectionTracker"
import { HOTSPOTS } from "../three/stations"
import { useOverlayOpen } from "../context/overlay"
import { opening, setOpening } from "../context/opening"
import { pluckNote } from "../lib/sound"

/**
 * The room, in one of two modes.
 *
 * "walk" (desktop): one WebGL canvas fixed behind the whole page. The page
 * is a walk through the room — each section is a place in it
 * (src/three/stations.js) and the camera eases there as the section takes
 * the viewport. The "hq" section is the map: the page content steps aside
 * and the doors to every page become clickable.
 *
 * "room" (phones, touch tablets, weak desktops): the same room, hosted
 * inside the HQ section only, so scrolling the rest of the page costs
 * nothing. It renders on demand — a frame only while something is moving
 * (a drag, a tap, the cut) — and sits idle otherwise. The section's door
 * rail drives it through the ref (`go`) and follows it through `onFacing`.
 */
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

const CinemaStage = forwardRef(function CinemaStage({ mode = "walk", onFacing }, ref) {
  const room = mode === "room"
  const { store, scene } = useSectionTracker(!room)
  const mouse = useRef({ x: 0, y: 0 })
  const hover = useRef(null)
  const portal = useRef(null)
  const stage = useRef(null)
  const orbit = useRef({ active: false, yaw: 0, pitch: 0, dragging: false, moved: 0, lastX: 0, lastY: 0, snap: false, span: 0.45 })
  const [hoverId, setHoverId] = useState(null)
  const fly = useRef(null)
  // Stage brightness, written by Rig every frame, read by the film look.
  const film = useRef(0)
  const cutting = useRef(false)
  const [veil, setVeil] = useState(false)
  const [inCut, setInCut] = useState(false)
  const [loop, setLoop] = useState("never")
  // The film look (walk mode only) is its own chunk: the postprocessing
  // library would otherwise ride along to every phone that hosts the room.
  const [Film, setFilm] = useState(null)
  useEffect(() => {
    if (room) return
    let alive = true
    import("../three/Film").then((m) => {
      if (alive) setFilm(() => m.default)
    })
    return () => {
      alive = false
    }
  }, [room])
  // The opening shot rolls once the room is built and the film look has had
  // a few frames to compile, so neither lands in the middle of the dolly.
  useEffect(() => {
    if (room || loop !== "always" || !Film || opening.state !== "pending") return
    let raf = 0
    let frames = 0
    const tick = () => {
      if (++frames < 4) raf = requestAnimationFrame(tick)
      else if (opening.state === "pending") setOpening("playing")
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [room, loop, Film])
  // A modal over the page hides the room: stop rendering it until it closes.
  const covered = useOverlayOpen()
  const accent = useMemo(() => tokenColor("--accent-rgb", "#d4ff3f"), [])
  const mapActive = room ? !inCut : scene.id === "hq" && scene.settled && !inCut
  orbit.current.active = mapActive

  // On-demand rendering (room mode): frames run only until `wakeUntil`.
  const wakeUntil = useRef(0)
  const invalidate = useRef(null)
  const wake = useCallback((ms) => {
    wakeUntil.current = Math.max(wakeUntil.current, performance.now() + ms)
    invalidate.current?.()
  }, [])
  const onReady = useCallback(() => {
    setLoop(room ? "demand" : "always")
    wake(1400) // long enough for the fade-in to settle
  }, [room, wake])

  /**
   * The cut. From the map: the camera flies to the door's station while the
   * room stays lit, the screen dips to dark, the page lands on the section
   * with no scroll animation, and the screen rises on it. Back to the map
   * (any link to #hq) runs the same dip with the fly hidden behind it.
   * Scrolling is locked for the second it takes.
   */
  const cutTo = useCallback(
    async (id, fromMap) => {
      if (cutting.current) return
      cutting.current = true
      setInCut(true)
      const lenis = window.__lenis
      lenis?.stop()
      try {
        if (fromMap) {
          fly.current = { id, lit: true }
          wake(CUT.fly + 200)
          await wait(CUT.fly)
        }
        setVeil(true)
        await wait(CUT.dip)
        if (!fromMap) fly.current = { id, lit: id === "hq" }
        jumpTo(id)
        wake(CUT.hold + CUT.rise + 400)
        await wait(CUT.hold)
        fly.current = null
        setVeil(false)
        await wait(CUT.rise)
      } finally {
        lenis?.start()
        cutting.current = false
        setInCut(false)
        // The door that was lit for the fly goes dark again behind the page.
        hover.current = null
        setHoverId(null)
        wake(600)
      }
    },
    [wake]
  )

  // A marker (its own tap-versus-drag check) or the door rail opens a door.
  const onGo = useCallback(
    (id) => {
      setHoverId(null)
      window.dispatchEvent(new CustomEvent("cursor-label", { detail: "" }))
      cutTo(id, true)
    },
    [cutTo]
  )

  // A click on the object itself: the press landed on the stage, so a drag
  // that ends over a door is told apart from a tap by how far it travelled.
  const onOpen = useCallback(
    (id) => {
      if (orbit.current.moved > 6) return
      onGo(id)
    },
    [onGo]
  )

  // Walk mode: links back to the map (the nav's "HQ") take the cut instead
  // of a long smooth scroll through every section.
  useEffect(() => {
    if (room) return
    const onClick = (e) => {
      const a = e.target.closest?.('a[href="#hq"]')
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      if (store.current.id === "hq") return
      e.preventDefault()
      cutTo("hq", false)
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [cutTo, store, room])

  // Hovering (or tapping) a door in the room: light it, highlight its
  // marker, and put its name on the cursor.
  const onHover = useCallback(
    (id) => {
      // Sound on: a newly hovered door plucks its note (lib/sound.js).
      if (id && id !== hover.current) pluckNote(HOTSPOTS.findIndex((h) => h.id === id), 0.25)
      hover.current = id
      setHoverId(id)
      const h = id && HOTSPOTS.find((x) => x.id === id)
      window.dispatchEvent(new CustomEvent("cursor-label", { detail: h ? h.label : "" }))
      wake(700)
    },
    [wake]
  )

  // Room mode: a tap on the door rail lights that door and takes the cut
  // to it, exactly as a tap on its marker would.
  useImperativeHandle(
    ref,
    () => ({
      go: (id) => {
        onHover(id)
        cutTo(id, true)
      },
    }),
    [onHover, cutTo]
  )

  // Drag to look around the map. On touch the wrapper allows vertical pans
  // through to the page (touch-action: pan-y), so only sideways drags orbit.
  const onPointerDown = (e) => {
    if (!mapActive || e.button !== 0) return
    const o = orbit.current
    o.dragging = true
    o.moved = 0
    o.lastX = e.clientX
    o.lastY = e.clientY
    wake(1200)
  }
  const onPointerMove = (e) => {
    const o = orbit.current
    if (!o.dragging) return
    const dx = e.clientX - o.lastX
    const dy = e.clientY - o.lastY
    o.lastX = e.clientX
    o.lastY = e.clientY
    o.moved += Math.abs(dx) + Math.abs(dy)
    // Room mode: a head turn with a wide range (the door is behind you);
    // vertical pans belong to the page there, so pitch is walk-mode only.
    const span = room ? 2.6 : 0.45
    o.span = span
    o.yaw = Math.max(-span, Math.min(span, o.yaw - dx * (room ? 0.006 : 0.0022)))
    o.pitch = room ? 0 : Math.max(-0.12, Math.min(0.22, o.pitch + dy * 0.0012))
    wake(500)
  }
  const onPointerUp = () => {
    const o = orbit.current
    // Room mode: a drag that turned the head settles on the nearest door.
    if (room && o.dragging && o.moved > 6) o.snap = true
    o.dragging = false
    wake(1400)
  }

  // Walk mode only: the mouse turns the view a few degrees. Room mode has
  // no hover, and rendering on every mouse move would defeat on-demand.
  useEffect(() => {
    if (room) return
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [room])

  const stageClass = room
    ? "relative h-full w-full select-none touch-pan-y"
    : `fixed inset-0 select-none ${mapActive ? "z-20 pointer-events-auto" : "z-[1] pointer-events-none"}`
  const portalClass = room
    ? "pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-[900ms]"
    : "pointer-events-none fixed inset-0 z-20 overflow-hidden transition-opacity duration-[900ms]"

  return (
    <>
      {/* Walk mode: while the map is active the stage rises above the page
          and takes the pointer, so the room's objects are hoverable and
          draggable. Room mode: the stage is simply the section's content. */}
      <div
        ref={stage}
        aria-hidden="true"
        className={stageClass}
        style={{ opacity: 0 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Canvas
          gl={{ antialias: !room, alpha: true, powerPreference: room ? "default" : "high-performance" }}
          dpr={room ? [1, 1.25] : [1, 1.5]}
          camera={{ fov: 50, near: 0.1, far: 40, position: [0, 1.75, 3] }}
          frameloop={covered ? "never" : loop}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
          // Walk mode renders untone-mapped on both of the film look's paths
          // (direct and composited), so their opaque surfaces match at the
          // hand-over (see Film.jsx). Room mode keeps the default.
          flat={!room}
          style={{ width: "100%", height: "100%" }}
        >
          <fogExp2 attach="fog" args={["#09090b", 0.045]} />
          <ambientLight intensity={0.85} />
          <hemisphereLight args={["#2a3040", "#0a0a0b", 1.1]} />
          <Pulse wakeUntil={wakeUntil} invalidateRef={invalidate} />
          <Rig tracker={store} mouse={mouse} orbit={orbit} fly={fly} dimEl={stage} film={room ? null : film} onReady={onReady} mode={mode} />
          <Cabin hoverRef={hover} accent={accent} onHover={onHover} onOpen={onOpen} glow={room ? undefined : DOOR_GLOW} />
          <Dust tracker={store} accent={accent} />
          <Hotspots portal={portal} active={mapActive} hoverRef={hover} hoverId={hoverId} onGo={onGo} />
          {room && <Facing onFacing={onFacing} />}
          {!room && <FilmLights />}
          {!room && Film && <Film level={film} />}
        </Canvas>
        {/* Room mode: markers live inside the stage box */}
        {room && <div ref={portal} className={portalClass} style={{ opacity: mapActive ? 1 : 0 }} />}
      </div>
      {/* Walk mode: markers above the page so the empty map section can't swallow clicks */}
      {!room && <div ref={portal} className={portalClass} style={{ opacity: mapActive ? 1 : 0 }} />}
      {/* The dip to dark that hides the page jump inside a cut */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] transition-opacity ease-in-out"
        style={{ background: "var(--bg)", opacity: veil ? 1 : 0, transitionDuration: `${veil ? CUT.dip : CUT.rise}ms` }}
      />
    </>
  )
})

export default CinemaStage
