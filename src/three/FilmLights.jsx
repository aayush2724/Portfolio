import { useMemo } from "react"
import * as THREE from "three"
import { makeGlow } from "./Cabin"

/**
 * Practical light for the film look (walk mode only): the ceiling panels
 * burn bright enough to bloom, each throws a soft pool on the floor, and
 * moonlight falls through the window as a shaft with a lit patch where it
 * lands. All of it is additive glass — no extra scene lights, so no shader
 * gets more expensive.
 *
 * The shaft is a stack of slanted sheets, each running from one line across
 * the window down to where that line's light hits the floor, so it reads
 * as a volume from any of the camera's stations.
 */
const PI = Math.PI
const H = 4
const PANELS = [-2.4, 0, 2.4]

/** Window opening (back wall, see Cabin) and the moonlight's direction. */
const WIN = { x0: 1.35, x1: 3.45, y0: 1.65, y1: 2.95, z: -3.4 }
const MOON = new THREE.Vector3(-0.25, -0.75, 0.6)
const SHEETS = 7

/** Where a point on the window lands on the floor along the moonlight. */
function land(x, y) {
  const t = y / -MOON.y
  return [x + MOON.x * t, 0.02, WIN.z + MOON.z * t]
}

/** Bright at the sill and gone well before the floor; no hard sides. */
function makeShaftMap() {
  const c = document.createElement("canvas")
  c.width = 64
  c.height = 128
  const ctx = c.getContext("2d")
  const along = ctx.createLinearGradient(0, 0, 0, 128)
  along.addColorStop(0, "rgba(255,255,255,1)")
  along.addColorStop(0.3, "rgba(255,255,255,0.3)")
  along.addColorStop(0.75, "rgba(255,255,255,0.05)")
  along.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = along
  ctx.fillRect(0, 0, 64, 128)
  ctx.globalCompositeOperation = "destination-in"
  const side = ctx.createLinearGradient(0, 0, 64, 0)
  side.addColorStop(0, "rgba(0,0,0,0)")
  side.addColorStop(0.5, "rgba(0,0,0,1)")
  side.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = side
  ctx.fillRect(0, 0, 64, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** One slanted quad from the window line at height y to its floor line. */
function sheetGeometry(y) {
  const a = [WIN.x0, y, WIN.z]
  const b = [WIN.x1, y, WIN.z]
  const c = land(WIN.x1, y)
  const d = land(WIN.x0, y)
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c, ...d], 3))
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2))
  g.setIndex([0, 3, 1, 1, 3, 2])
  return g
}

/** The moonlit patch on the floor: the window's footprint along the light. */
function patchGeometry() {
  const pts = [land(WIN.x0, WIN.y1), land(WIN.x1, WIN.y1), land(WIN.x1, WIN.y0), land(WIN.x0, WIN.y0)]
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts.flat(), 3))
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2))
  g.setIndex([0, 3, 1, 1, 3, 2])
  return g
}

/**
 * Door glows [idle, hovered] under the film look. The composer blends
 * additive light in linear space, where a faint glow on a dark wall comes
 * out several times brighter than the same opacity blended on screen, so
 * the room's own levels (Cabin's DOOR_GLOW) would read as lime blobs here.
 */
export const DOOR_GLOW = [0.014, 0.13]

const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }

export default function FilmLights() {
  const glow = useMemo(makeGlow, [])
  const shaftMap = useMemo(makeShaftMap, [])
  const sheets = useMemo(
    () => Array.from({ length: SHEETS }, (_, i) => sheetGeometry(THREE.MathUtils.lerp(WIN.y0, WIN.y1, i / (SHEETS - 1)))),
    []
  )
  const patch = useMemo(patchGeometry, [])

  return (
    <group>
      {PANELS.map((x) => (
        <group key={x}>
          {/* the panel's face, hot enough to bloom */}
          <mesh rotation={[PI / 2, 0, 0]} position={[x, H - 0.015, -0.5]}>
            <planeGeometry args={[1.16, 0.26]} />
            <meshBasicMaterial color="#e9eeff" toneMapped={false} />
          </mesh>
          {/* its pool on the floor */}
          <mesh rotation={[-PI / 2, 0, 0]} position={[x, 0.015, -0.5]} scale={[3.4, 2.4, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={glow} color="#fff0dc" opacity={0.085} {...additive} />
          </mesh>
        </group>
      ))}
      {sheets.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial map={shaftMap} color="#9fb8ff" opacity={0.016} side={THREE.DoubleSide} {...additive} />
        </mesh>
      ))}
      <mesh geometry={patch}>
        <meshBasicMaterial map={glow} color="#9fb8ff" opacity={0.12} {...additive} />
      </mesh>
    </group>
  )
}
