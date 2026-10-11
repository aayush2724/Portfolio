import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { STATIONS, DEFAULT_STATION } from "./stations"
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

export default function Rig({ tracker, mouse, orbit, fly, dimEl, onReady }) {
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
    const flying = fly.current && STATIONS[fly.current.id]
    const i = Math.floor(s.track)
    const f = flying ? 0 : s.track - i
    const a = flying ? STATIONS[fly.current.id] : STATIONS[s.ids[i]] || DEFAULT_STATION
    const b = flying ? a : STATIONS[s.ids[i + 1]] || a
    const k = flying ? 5 : 7

    // Stations are framed for a 16:10 screen. On a narrower viewport the
    // horizontal field of view shrinks, so widen the lens (up to 80°) and
    // pull the camera back along its line of sight for whatever the lens
    // cap does not cover; interior stations stay inside the walls.
    const aspect = size.width / Math.max(1, size.height)
    const squeeze = Math.max(1, 1.6 / aspect)
    const fov = Math.min(80, 50 * squeeze)
    const pull = squeeze / (fov / 50)
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
    const wantYaw = o.active ? o.yaw : 0
    const wantPitch = o.active ? o.pitch : 0
    spin.current.yaw = THREE.MathUtils.damp(spin.current.yaw, wantYaw, 6, d)
    spin.current.pitch = THREE.MathUtils.damp(spin.current.pitch, wantPitch, 6, d)
    tmpC.fromArray(a.look).lerp(tmpB.fromArray(b.look), f)
    if (Math.abs(spin.current.yaw) > 1e-4 || Math.abs(spin.current.pitch) > 1e-4) {
      tmpA.sub(tmpC).applyAxisAngle(Y_AXIS, spin.current.yaw)
      tmpA.y += spin.current.pitch * tmpA.length()
      tmpA.add(tmpC)
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, tmpA.x, k, d)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, tmpA.y, k, d)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tmpA.z, k, d)

    // Mouse-look: a few degrees everywhere, a wider sweep on the map.
    const sway = o.active ? 0.55 : 0.3
    const l = look.current
    l.x = THREE.MathUtils.damp(l.x, tmpC.x + mouse.current.x * sway, k, d)
    l.y = THREE.MathUtils.damp(l.y, tmpC.y - mouse.current.y * sway * 0.6, k, d)
    l.z = THREE.MathUtils.damp(l.z, tmpC.z, k, d)
    camera.lookAt(l)

    const target = flying && fly.current.lit ? 1 : THREE.MathUtils.lerp(a.dim, b.dim, f)
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
