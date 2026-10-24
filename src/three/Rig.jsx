import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { STATIONS, DEFAULT_STATION, HOTSPOTS } from "./stations"
import { VESTIBULE } from "./Cabin"
import { tokenColor } from "./tokens"

/**
 * Camera + environment.
 *
 * The camera's position, aim and the stage brightness are read off the
 * tracker's continuous `track` value: between station i and i+1 they are the
 * blend of the two. A light exponential damp on top irons out frame-to-frame
 * jitter without adding lag, and the mouse turns the view a few degrees.
 * Lighting is lights only (no environment map): the PBR + env-map shaders
 * were the slowest thing on the page to compile on integrated GPUs.
 */
const tmpA = new THREE.Vector3()
const tmpB = new THREE.Vector3()
const tmpC = new THREE.Vector3()
const Y_AXIS = new THREE.Vector3(0, 1, 0)
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))

/**
 * The head turn (yaw) at which a `turn` station faces a door, nearest to the
 * current turn and inside the drag's range; null if no door is within ~70°.
 * A turn of y swings the aim by -y, so facing heading h from base heading b
 * means y = b - h.
 */
function yawToNearestDoor(st, yaw, span) {
  const b = Math.atan2(st.look[0] - st.pos[0], st.look[2] - st.pos[2])
  let best = null
  let bestD = 1.2
  for (const h of HOTSPOTS) {
    const y0 = wrap(b - Math.atan2(h.at[0] - st.pos[0], h.at[2] - st.pos[2]))
    for (const y of [y0, y0 + 2 * Math.PI, y0 - 2 * Math.PI]) {
      const d = Math.abs(y - yaw)
      if (Math.abs(y) <= span && d < bestD) {
        bestD = d
        best = y
      }
    }
  }
  return best
}

/**
 * On-demand frame driver. In "demand" frameloop a frame only renders when
 * something calls invalidate(); while the stage is awake each frame asks
 * for the next, so damped motion can settle, then rendering stops.
 */
export function Pulse({ wakeUntil, invalidateRef }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidateRef.current = invalidate
    return () => {
      invalidateRef.current = null
    }
  }, [invalidate, invalidateRef])
  useFrame(() => {
    if (performance.now() < wakeUntil.current) invalidate()
  })
  return null
}

export default function Rig({ tracker, mouse, orbit, fly, dimEl, onReady, mode = "walk" }) {
  const room = mode === "room"
  const { gl, scene, camera, size } = useThree()
  const look = useRef(new THREE.Vector3(0, 1.45, -3))
  const dim = useRef(0)
  const spin = useRef({ yaw: 0, pitch: 0 })
  const bg = useRef(tokenColor("--bg-rgb", "#09090b"))
  const clear = useRef(0)

  useEffect(() => {
    // Shaders compile in the GPU process (KHR_parallel_shader_compile) while
    // the page stays responsive. The stage reports ready when every program
    // is built, or after two seconds regardless, so a slow driver can delay
    // the room but never hold it hostage. The owner starts the frame loop:
    // it must live in React state, because <Canvas> re-applies its frameloop
    // prop on every render and would otherwise switch the loop back off.
    let cancelled = false
    const ready = gl.compileAsync(scene, camera).catch(() => {})
    const cap = new Promise((r) => setTimeout(r, 2000))
    Promise.race([ready, cap]).then(() => {
      if (!cancelled) onReady?.()
    })
    return () => {
      cancelled = true
    }
  }, [gl, scene, camera, onReady])

  useFrame((_, dt) => {
    const s = tracker.current
    const d = Math.min(dt, 0.05)
    // A cut in progress flies straight to one station regardless of scroll,
    // and keeps the room lit until the page has landed.
    // Stations are framed for a 16:10 screen. Portrait viewports get their
    // own framing of the map; other narrow ones widen the lens (up to 80°)
    // and pull the camera back along its line of sight for whatever the lens
    // cap does not cover. Interior stations stay inside the walls.
    const aspect = size.width / Math.max(1, size.height)
    const portrait = aspect < 1
    const station = (id) => (id === "hq" && portrait ? STATIONS.hq_portrait : STATIONS[id])

    const flying = fly.current && STATIONS[fly.current.id]
    const i = Math.floor(s.track)
    const f = flying || room ? 0 : s.track - i
    // Room mode never leaves the map station; the cut's fly still applies.
    const a = flying ? station(fly.current.id) : room ? station("hq") : station(s.ids[i]) || DEFAULT_STATION
    const b = flying || room ? a : station(s.ids[i + 1]) || a
    const k = flying ? 5 : 7

    const squeeze = Math.max(1, 1.6 / aspect)
    const lens = a.lens || 50
    const fov = a.fov ? a.fov : Math.min(80, lens * squeeze)
    const pull = a.fov || portrait ? 1 : squeeze / (fov / lens)
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    tmpA.fromArray(a.pos).lerp(tmpB.fromArray(b.pos), f)
    if (pull > 1) {
      const inside = tmpA.z < 3.4
      tmpB.fromArray(a.look).lerp(tmpC.fromArray(b.look), f)
      tmpA.sub(tmpB).multiplyScalar(pull).add(tmpB)
      if (inside) {
        tmpA.x = THREE.MathUtils.clamp(tmpA.x, -4.6, 4.6)
        tmpA.z = THREE.MathUtils.clamp(tmpA.z, -3.1, 3.1)
        tmpA.y = THREE.MathUtils.clamp(tmpA.y, 0.6, 3.6)
      }
    }
    // Drag-to-orbit (map only): swing the camera around the point it looks
    // at. Eases back to the station once the reader scrolls on.
    const o = orbit.current
    // A head turn that has just been let go settles on the nearest door, so
    // every swipe lands facing something.
    if (o.snap && !o.dragging) {
      o.snap = false
      if (a.turn) {
        const y = yawToNearestDoor(a, o.yaw, o.span)
        if (y !== null) o.yaw = y
      }
    }
    const wantYaw = o.active ? o.yaw : 0
    const wantPitch = o.active ? o.pitch : 0
    spin.current.yaw = THREE.MathUtils.damp(spin.current.yaw, wantYaw, 6, d)
    spin.current.pitch = THREE.MathUtils.damp(spin.current.pitch, wantPitch, 6, d)
    tmpC.fromArray(a.look).lerp(tmpB.fromArray(b.look), f)
    if (Math.abs(spin.current.yaw) > 1e-4 || Math.abs(spin.current.pitch) > 1e-4) {
      if (a.turn) {
        // Head turn: swing the aim around the camera, which stays put. The
        // sign is flipped so the scene follows the finger (drag left, the
        // room slides left and the right wall comes into view), as a
        // panorama does on touch.
        tmpC.sub(tmpA).applyAxisAngle(Y_AXIS, -spin.current.yaw)
        tmpC.y += spin.current.pitch * tmpC.length()
        tmpC.add(tmpA)
      } else {
        // Orbit: swing the camera around the point it looks at.
        tmpA.sub(tmpC).applyAxisAngle(Y_AXIS, spin.current.yaw)
        tmpA.y += spin.current.pitch * tmpA.length()
        tmpA.add(tmpC)
      }
    }

    // The shell is 10 wide and 4 high, from the back wall through the
    // vestibule behind the front wall. The camera never leaves it, so the
    // frame holds room on every side — a drag that would swing it through a
    // wall or the ceiling stops at the wall instead.
    tmpA.x = THREE.MathUtils.clamp(tmpA.x, -4.6, 4.6)
    tmpA.y = THREE.MathUtils.clamp(tmpA.y, 0.5, 3.6)
    tmpA.z = THREE.MathUtils.clamp(tmpA.z, -3.1, 3.5 + VESTIBULE - 0.6)

    camera.position.x = THREE.MathUtils.damp(camera.position.x, tmpA.x, k, d)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, tmpA.y, k, d)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tmpA.z, k, d)

    // Mouse-look: a few degrees everywhere, a wider sweep on the map.
    const sway = 0.3
    const l = look.current
    l.x = THREE.MathUtils.damp(l.x, tmpC.x + mouse.current.x * sway, k, d)
    l.y = THREE.MathUtils.damp(l.y, tmpC.y - mouse.current.y * sway * 0.6, k, d)
    l.z = THREE.MathUtils.damp(l.z, tmpC.z, k, d)
    camera.lookAt(l)

    const target = (flying && fly.current.lit) || room ? 1 : THREE.MathUtils.lerp(a.dim, b.dim, f)
    dim.current = THREE.MathUtils.damp(dim.current, target, k, d)
    if (dimEl.current) dimEl.current.style.opacity = dim.current.toFixed(3)

    // On the map the canvas clears to the page colour, so the room floats in
    // a clean void instead of over the flat grid; under content it stays
    // transparent so the grid shows through the dimmed room as before.
    const wantClear = THREE.MathUtils.clamp((dim.current - 0.5) * 2.5, 0, 1)
    clear.current = THREE.MathUtils.damp(clear.current, wantClear, k, d)
    gl.setClearColor(bg.current, clear.current)
  })

  return null
}
