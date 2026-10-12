import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { HOTSPOTS } from "./stations"

/**
 * The cabin interior — a low-poly ops den built entirely from primitives and
 * canvas-drawn textures, so nothing is fetched. Each page's "door" is an
 * object in the room (see HOTSPOTS); hovering its marker lifts a soft glow
 * on it. Per-frame work is limited to blinking rack LEDs, a faint screen
 * flicker, the holo lattice spin and the hover glows.
 *
 * Layout (x across, z depth, y up; floor y=0):
 *   back wall  z=-3.5  desk + five-monitor array (left), window (right)
 *   left wall  x=-5    bookshelf (back), corkboard (front)
 *   right wall x=5     twin racks (back), six-screen status wall, guitar, arcade (front)
 *   front wall z=3.5   the door; the shell runs on behind it (VESTIBULE)
 */

const W = 10
const D = 7
const H = 4
/**
 * The shell continues this far past the (single-sided) front wall. The HQ
 * dollhouse camera stands in that stretch, so whatever the screen's shape
 * and wherever a drag swings the camera, floor, ceiling and side walls run
 * to every edge of the frame — never the page behind the room. From inside
 * the room the front wall hides it. Rig keeps the camera within it.
 */
export const VESTIBULE = 8
const PI = Math.PI

function canvasTexture(w, h, draw, nearest = false) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  draw(c.getContext("2d"), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  if (nearest) t.magFilter = t.minFilter = THREE.NearestFilter
  return t
}

const rgba = (col, a) => `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},${a})`

function makeTextures(accent) {
  const dark = (ctx, w, h) => {
    ctx.fillStyle = "#090c09"
    ctx.fillRect(0, 0, w, h)
  }
  const code = canvasTexture(256, 160, (ctx, w, h) => {
    dark(ctx, w, h)
    for (let i = 0; i < 13; i++) {
      const y = 10 + i * 11
      const indent = (i % 4) * 12
      const len = 50 + ((i * 37) % 120)
      ctx.fillStyle = rgba(accent, i % 3 === 0 ? 0.8 : 0.3)
      ctx.fillRect(14 + indent, y, len, 4)
    }
    ctx.fillStyle = rgba(accent, 1)
    ctx.fillRect(14, 150, 7, 4)
  })
  const dash = canvasTexture(256, 144, (ctx, w, h) => {
    dark(ctx, w, h)
    ctx.strokeStyle = rgba(accent, 0.14)
    for (let y = 24; y < h; y += 24) {
      ctx.beginPath()
      ctx.moveTo(16, y)
      ctx.lineTo(w - 16, y)
      ctx.stroke()
    }
    const bars = [40, 62, 48, 78, 70, 92, 66, 104, 84, 112, 96, 120]
    bars.forEach((b, i) => {
      ctx.fillStyle = rgba(accent, i === bars.length - 1 ? 1 : 0.5)
      ctx.fillRect(20 + i * 19, h - 12 - b, 12, b)
    })
  })
  const graph = canvasTexture(256, 144, (ctx, w, h) => {
    dark(ctx, w, h)
    ctx.strokeStyle = rgba(accent, 0.12)
    for (let x = 32; x < w; x += 32) {
      ctx.beginPath()
      ctx.moveTo(x, 8)
      ctx.lineTo(x, h - 8)
      ctx.stroke()
    }
    ctx.strokeStyle = rgba(accent, 0.9)
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= 16; i++) {
      const x = 12 + i * 14.5
      const y = h - 24 - Math.abs(Math.sin(i * 1.3) * 40 + i * 4)
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    }
    ctx.stroke()
  })
  const term = canvasTexture(256, 144, (ctx, w, h) => {
    dark(ctx, w, h)
    for (let i = 0; i < 11; i++) {
      const y = 12 + i * 12
      ctx.fillStyle = rgba(accent, 0.9)
      ctx.fillRect(10, y, 6, 4)
      ctx.fillStyle = `rgba(220,224,210,${i % 2 ? 0.35 : 0.55})`
      ctx.fillRect(22, y, 30 + ((i * 53) % 150), 4)
    }
  })
  const net = canvasTexture(256, 144, (ctx, w, h) => {
    dark(ctx, w, h)
    const pts = Array.from({ length: 14 }, (_, i) => [24 + ((i * 71) % 208), 20 + ((i * 47) % 104)])
    ctx.strokeStyle = rgba(accent, 0.25)
    pts.forEach(([x, y], i) => {
      const [x2, y2] = pts[(i * 5 + 3) % pts.length]
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    })
    pts.forEach(([x, y], i) => {
      ctx.fillStyle = rgba(accent, i % 4 === 0 ? 1 : 0.55)
      ctx.beginPath()
      ctx.arc(x, y, i % 4 === 0 ? 4 : 2.5, 0, PI * 2)
      ctx.fill()
    })
  })
  const stars = canvasTexture(256, 192, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, "#070a14")
    g.addColorStop(1, "#0d1322")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 140; i++) {
      const x = (i * 97) % w
      const y = (i * 61) % h
      ctx.fillStyle = `rgba(230,238,255,${0.3 + ((i * 13) % 7) / 10})`
      ctx.fillRect(x, y, i % 9 === 0 ? 2 : 1, i % 9 === 0 ? 2 : 1)
    }
    ctx.fillStyle = "#e9eefc"
    ctx.beginPath()
    ctx.arc(190, 52, 16, 0, PI * 2)
    ctx.fill()
    ctx.fillStyle = "#0d1322"
    ctx.beginPath()
    ctx.arc(198, 46, 14, 0, PI * 2)
    ctx.fill()
  })
  const neon = canvasTexture(512, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.font = '700 84px "Clash Display", "Inter", sans-serif'
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.shadowColor = rgba(accent, 0.9)
    ctx.shadowBlur = 24
    ctx.fillStyle = rgba(accent, 1)
    ctx.fillText("aayush.", w / 2, h / 2 + 4)
  })
  const arcade = canvasTexture(16, 16, (ctx, w, h) => {
    ctx.fillStyle = "#06080a"
    ctx.fillRect(0, 0, w, h)
    const cells = [[2, 3], [5, 3], [8, 3], [11, 3], [2, 7], [8, 7], [5, 11], [11, 11], [2, 11]]
    cells.forEach(([x, y], i) => {
      ctx.fillStyle = rgba(accent, 0.35 + ((i * 29) % 6) / 10)
      ctx.fillRect(x, y, 3, 3)
    })
  }, true)
  return { code, dash, graph, term, net, stars, neon, arcade }
}

/** Soft radial sprite for hover glows and the moon. */
function makeGlow() {
  return canvasTexture(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, "rgba(255,255,255,1)")
    g.addColorStop(0.35, "rgba(255,255,255,0.3)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
  })
}

/**
 * Wall posters, drawn on canvas so nothing copyrighted ships: typographic
 * treatments of band names with original motifs, plus three Barcelona prints
 * (blaugrana stripes, a stadium bowl, the spire skyline).
 */
function makePosters() {
  const display = (px) => `700 ${px}px "Clash Display", "Inter", sans-serif`
  const mono = (px) => `500 ${px}px "JetBrains Mono", monospace`
  const poster = (bg, draw) =>
    canvasTexture(128, 176, (ctx, w, h) => {
      if (typeof bg === "function") bg(ctx, w, h)
      else {
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)
      }
      draw(ctx, w, h)
      ctx.strokeStyle = "rgba(255,255,255,0.08)"
      ctx.strokeRect(4.5, 4.5, w - 9, h - 9)
    })
  const title = (ctx, text, y, color, px = 22) => {
    ctx.fillStyle = color
    ctx.font = display(px)
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, 64, y)
  }
  const sub = (ctx, text, y, color) => {
    ctx.fillStyle = color
    ctx.font = mono(7)
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, 64, y)
  }
  const circle = (ctx, x, y, r, fill, stroke) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, PI * 2)
    if (fill) {
      ctx.fillStyle = fill
      ctx.fill()
    }
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.stroke()
    }
  }
  return {
    zeppelin: poster("#0b0b0b", (ctx) => {
      ctx.fillStyle = "#8a8a90"
      ctx.beginPath()
      ctx.ellipse(64, 58, 40, 13, -0.15, 0, PI * 2)
      ctx.fill()
      ctx.fillRect(40, 66, 22, 7)
      title(ctx, "LED", 112, "#efe8d8", 26)
      title(ctx, "ZEPPELIN", 136, "#efe8d8", 20)
      sub(ctx, "STAIRWAY TO HEAVEN · 1971", 160, "#8a8a90")
    }),
    floyd: poster("#000000", (ctx) => {
      ctx.strokeStyle = "#f0f0f0"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(64, 30)
      ctx.lineTo(92, 80)
      ctx.lineTo(36, 80)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(8, 70)
      ctx.lineTo(50, 60)
      ctx.stroke()
      const bands = ["#e63946", "#f4a261", "#f1e05a", "#4caf50", "#4f8ef7", "#8e5bd8"]
      bands.forEach((c, i) => {
        ctx.strokeStyle = c
        ctx.beginPath()
        ctx.moveTo(78, 62)
        ctx.lineTo(122, 56 + i * 7)
        ctx.stroke()
      })
      title(ctx, "PINK FLOYD", 122, "#f0f0f0", 17)
      sub(ctx, "THE DARK SIDE · 1973", 150, "#777")
    }),
    greenday: poster("#0a0a0a", (ctx) => {
      ctx.strokeStyle = "#e63946"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(64, 92)
      ctx.bezierCurveTo(20, 60, 36, 22, 64, 44)
      ctx.bezierCurveTo(92, 22, 108, 60, 64, 92)
      ctx.stroke()
      ctx.fillStyle = "#e63946"
      ctx.fillRect(62, 36, 4, 16)
      title(ctx, "GREEN DAY", 122, "#f2f2f2", 18)
      sub(ctx, "AMERICAN IDIOT · 2004", 150, "#8fbf6a")
    }),
    coldplay: poster(
      (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, w, h)
        g.addColorStop(0, "#1a1446")
        g.addColorStop(1, "#5a1f6e")
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      },
      (ctx) => {
        const cols = ["#ff5e8a", "#ffd166", "#06d6a0", "#4cc9f0", "#f4a261", "#c77dff"]
        for (let i = 0; i < 26; i++) {
          const x = 14 + ((i * 53) % 100)
          const y = 14 + ((i * 37) % 80)
          circle(ctx, x, y, 2 + (i % 4), cols[i % cols.length])
        }
        title(ctx, "COLDPLAY", 122, "#ffffff", 20)
        sub(ctx, "A HEAD FULL OF DREAMS", 150, "#d9c7ff")
      }
    ),
    sheeran: poster("#1f8a8a", (ctx) => {
      ctx.fillStyle = "#ffffff"
      ctx.font = display(70)
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("÷", 64, 60)
      title(ctx, "ED SHEERAN", 122, "#ffffff", 17)
      sub(ctx, "DIVIDE · 2017", 150, "#bfe6e6")
    }),
    gnr: poster("#111111", (ctx) => {
      ;[[46, 56], [82, 56]].forEach(([x, y]) => {
        circle(ctx, x, y, 14, "#b3122e")
        circle(ctx, x, y, 8, "#7a0c20")
        circle(ctx, x, y, 3, "#e63946")
        ctx.strokeStyle = "#3d7a3a"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(x, y + 14)
        ctx.lineTo(x, y + 40)
        ctx.stroke()
      })
      title(ctx, "GUNS N'", 116, "#f2c14e", 20)
      title(ctx, "ROSES", 138, "#f2c14e", 20)
      sub(ctx, "APPETITE FOR DESTRUCTION", 160, "#8a7a4a")
    }),
    nirvana: poster("#f2e21a", (ctx) => {
      ctx.fillStyle = "#111"
      for (let i = 0; i < 4; i++) ctx.fillRect(24, 34 + i * 12, 80, 5)
      title(ctx, "NIRVANA", 112, "#111", 26)
      sub(ctx, "SEATTLE · 1991", 150, "#333")
    }),
    metallica: poster("#101010", (ctx) => {
      ctx.strokeStyle = "#e8e8e8"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(20, 40)
      ctx.lineTo(108, 40)
      ctx.lineTo(96, 82)
      ctx.lineTo(32, 82)
      ctx.closePath()
      ctx.stroke()
      title(ctx, "METALLICA", 116, "#e8e8e8", 18)
      sub(ctx, "MASTER OF PUPPETS · 1986", 150, "#777")
    }),
    acdc: poster("#161616", (ctx) => {
      ctx.fillStyle = "#e1261c"
      ctx.beginPath()
      ctx.moveTo(70, 26)
      ctx.lineTo(50, 66)
      ctx.lineTo(66, 66)
      ctx.lineTo(56, 96)
      ctx.lineTo(82, 54)
      ctx.lineTo(66, 54)
      ctx.closePath()
      ctx.fill()
      title(ctx, "AC/DC", 124, "#e1261c", 30)
      sub(ctx, "HIGH VOLTAGE · 1976", 154, "#8a3a35")
    }),
    barca: poster("#004d98", (ctx, w, h) => {
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = "#a50044"
        ctx.fillRect(8 + i * 32, 0, 16, h)
      }
      ctx.fillStyle = "#f2c94c"
      ctx.fillRect(0, 0, w, 22)
      ctx.fillStyle = "#1a1a1a"
      ctx.font = display(11)
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("FC BARCELONA", 64, 11)
      circle(ctx, 64, 62, 20, "#ffffff")
      ctx.fillStyle = "#1a1a1a"
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = -PI / 2 + (i * 2 * PI) / 5
        const x = 64 + Math.cos(a) * 8
        const y = 62 + Math.sin(a) * 8
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = "rgba(0,0,0,0.5)"
      ctx.fillRect(10, 96, 108, 58)
      title(ctx, "MÉS QUE", 112, "#ffffff", 15)
      title(ctx, "UN CLUB", 130, "#ffffff", 15)
      sub(ctx, "EST. 1899", 148, "#f2c94c")
    }),
    campnou: poster("#0d1b2a", (ctx) => {
      ctx.strokeStyle = "#e9eefc"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.ellipse(64, 60, 50, 30, 0, 0, PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(64, 60, 38, 20, 0, 0, PI * 2)
      ctx.stroke()
      ctx.fillStyle = "#2f8f4e"
      ctx.fillRect(44, 50, 40, 20)
      ctx.strokeStyle = "#e9eefc"
      ctx.lineWidth = 1
      ctx.strokeRect(44, 50, 40, 20)
      ctx.beginPath()
      ctx.moveTo(64, 50)
      ctx.lineTo(64, 70)
      ctx.stroke()
      title(ctx, "CAMP NOU", 116, "#e9eefc", 18)
      sub(ctx, "VISCA EL BARÇA", 140, "#f2c94c")
      sub(ctx, "99,354 · BARCELONA", 156, "#7f8ea3")
    }),
    barcelona: poster("#e8d9b5", (ctx) => {
      circle(ctx, 98, 34, 14, "#e0893a")
      ctx.fillStyle = "#2b2119"
      const spires = [[14, 70], [28, 48], [44, 36], [58, 56], [72, 30], [86, 44], [100, 62], [114, 74]]
      spires.forEach(([x, top]) => {
        ctx.beginPath()
        ctx.moveTo(x - 7, 108)
        ctx.lineTo(x, top)
        ctx.lineTo(x + 7, 108)
        ctx.closePath()
        ctx.fill()
        circle(ctx, x, top, 1.6, "#e0893a")
      })
      ctx.fillRect(0, 106, 128, 6)
      title(ctx, "BARCELONA", 132, "#2b2119", 16)
      sub(ctx, "SAGRADA FAMÍLIA · GRÀCIA", 150, "#6b5a40")
      sub(ctx, "41°N · 2°E", 162, "#6b5a40")
    }),
  }
}

/** Where the posters hang: [x, y, z] and rotation-y (portrait, 0.6 × 0.82). */
const POSTERS = [
  // back wall, left of the desk
  { key: "zeppelin",  pos: [-4.35, 3.0, -3.46],  rot: 0 },
  { key: "floyd",     pos: [-4.35, 1.95, -3.46], rot: 0 },
  { key: "greenday",  pos: [-4.35, 0.9, -3.46],  rot: 0 },
  // left wall: above the bookshelf, the gap, above the corkboard, the front
  { key: "coldplay",  pos: [-4.96, 3.3, -1.65],  rot: PI / 2 },
  { key: "sheeran",   pos: [-4.96, 3.3, -0.8],   rot: PI / 2 },
  { key: "barca",     pos: [-4.96, 2.7, 0.05],   rot: PI / 2 },
  { key: "campnou",   pos: [-4.96, 1.65, 0.05],  rot: PI / 2 },
  { key: "barcelona", pos: [-4.96, 3.25, 1.3],   rot: PI / 2 },
  { key: "gnr",       pos: [-4.96, 2.6, 2.7],    rot: PI / 2 },
  // right wall by the arcade, and the front wall by the door
  { key: "nirvana",   pos: [4.96, 2.75, 2.3],    rot: -PI / 2 },
  { key: "metallica", pos: [4.96, 2.4, 1.75],    rot: -PI / 2 },
  { key: "acdc",      pos: [-0.5, 2.3, 3.46],    rot: PI },
]

function Poster({ pos, rot, map, size = [0.6, 0.82] }) {
  return (
    <mesh position={pos} rotation={[0, rot, 0]}>
      <planeGeometry args={size} />
      <meshPhongMaterial map={map} shininess={4} specular="#0c0c0e" />
    </mesh>
  )
}

const BOOK_COLORS = ["#3b3a46", "#4a3a2e", "#2e3d35", "#3a2f44", "#45423a", "#2f3a4a"]
const WOOD = "#2b2119"
const METAL = "#1a1a1f"

function Books({ y, accent }) {
  const items = useMemo(() => {
    const out = []
    let z = -1.95
    let i = 0
    while (z < -0.5) {
      const w = 0.09 + ((i * 7) % 5) * 0.015
      const h = 0.32 + ((i * 11) % 6) * 0.03
      out.push({ z: z + w / 2, w, h, color: i % 7 === 3 ? null : BOOK_COLORS[i % BOOK_COLORS.length] })
      z += w + 0.012
      i++
    }
    return out
  }, [])
  return items.map((b, i) => (
    <mesh key={i} position={[-4.78, y + b.h / 2, b.z]}>
      <boxGeometry args={[0.26, b.h, b.w]} />
      {b.color ? <meshPhongMaterial color={b.color} shininess={4} specular="#0c0c0e" /> : <meshPhongMaterial color={accent} emissive={accent} emissiveIntensity={0.35} shininess={12} specular="#1e1e22" />}
    </mesh>
  ))
}

/** A monitor: bezel, screen, and either a stand (desk) or an arm (upper row / wall). */
function Monitor({ position, rotation = [0, 0, 0], size = [1.0, 0.6], map, mount = "stand", screenRef }) {
  const [w, h] = size
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[w, h + 0.04, 0.05]} />
        <meshPhongMaterial color="#111114" shininess={12} specular="#1e1e22" />
      </mesh>
      <mesh ref={screenRef} position={[0, 0, 0.03]}>
        <planeGeometry args={[w - 0.08, h - 0.04]} />
        <meshBasicMaterial map={map} toneMapped={false} transparent />
      </mesh>
      {mount === "stand" && (
        <mesh position={[0, -(h / 2) - 0.1, -0.05]}>
          <boxGeometry args={[0.08, 0.2, 0.08]} />
          <meshPhongMaterial color={METAL} shininess={45} specular="#55555c" />
        </mesh>
      )}
      {mount === "arm" && (
        <mesh position={[0, 0, -0.12]}>
          <boxGeometry args={[0.06, 0.06, 0.2]} />
          <meshPhongMaterial color={METAL} shininess={45} specular="#55555c" />
        </mesh>
      )}
    </group>
  )
}

function Rack({ position, leds, offset, accent }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.7, 2.0, 0.8]} />
        <meshPhongMaterial color={METAL} shininess={45} specular="#55555c" />
      </mesh>
      {Array.from({ length: 7 }, (_, r) => (
        <mesh key={r} position={[-0.36, -0.8 + r * 0.27, 0]}>
          <boxGeometry args={[0.02, 0.012, 0.74]} />
          <meshPhongMaterial color="#2a2a30" shininess={45} specular="#55555c" />
        </mesh>
      ))}
      {Array.from({ length: 32 }, (_, i) => {
        const row = Math.floor(i / 4)
        const col = i % 4
        return (
          <mesh key={i} ref={(el) => (leds.current[offset + i] = el)} position={[-0.36, -0.68 + row * 0.21, -0.28 + col * 0.19]}>
            <boxGeometry args={[0.02, 0.035, 0.035]} />
            <meshPhongMaterial color={accent} emissive={accent} emissiveIntensity={0.3} toneMapped={false} shininess={12} specular="#1e1e22" />
          </mesh>
        )
      })}
    </group>
  )
}

/**
 * Pointer targets for the doors: one invisible box around each object so the
 * room itself is hoverable and clickable, not only the floating markers.
 * [x, y, z] centre and [w, h, d] size.
 */
const DOOR_HITS = {
  projects:     { at: [-1.8, 1.5, -2.7],  size: [3.9, 1.9, 1.5] },
  about:        { at: [-4.8, 1.3, -1.2],  size: [0.6, 2.7, 1.7] },
  skills:       { at: [4.55, 1.05, -2.5], size: [0.9, 2.2, 1.8] },
  stats:        { at: [4.9, 2.35, -0.6],  size: [0.3, 1.4, 2.3] },
  journey:      { at: [-4.95, 2.2, 1.3],  size: [0.3, 1.3, 1.7] },
  achievements: { at: [-1.8, 3.15, -3.3], size: [2.1, 0.7, 0.5] },
  play:         { at: [4.5, 1.1, 2.3],    size: [1.0, 2.3, 1.0] },
  life:         { at: [4.9, 2.6, 1.1],    size: [0.4, 2.0, 0.9] },
  contact:      { at: [-2.5, 1.2, 3.42],  size: [1.3, 2.5, 0.3] },
}

/** Thin emissive strip — under-desk / baseboard LED lighting. */
function Strip({ position, size, accent, rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.75} />
    </mesh>
  )
}

export default function Cabin({ hoverRef, accent, onHover, onOpen }) {
  const tex = useMemo(() => makeTextures(accent), [accent])
  const glowMap = useMemo(makeGlow, [])
  const posters = useMemo(makePosters, [])
  const leds = useRef([])
  const screens = useRef([])
  const glows = useRef([])
  const holo = useRef()
  const holoGlow = useRef()

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    leds.current.forEach((m, i) => {
      if (!m) return
      const on = Math.sin(t * 2.4 + i * 1.73) > 0.35
      m.material.emissiveIntensity = on ? 1.4 : 0.15
    })
    screens.current.forEach((m, i) => {
      if (m) m.material.opacity = 0.93 + Math.sin(t * 6 + i * 1.1) * 0.035
    })
    if (holo.current) {
      holo.current.rotation.y = t * 0.35
      holo.current.rotation.x = Math.sin(t * 0.4) * 0.3
      holo.current.position.y = 1.55 + Math.sin(t * 1.1) * 0.05
      holo.current.material.opacity = 0.45 + Math.sin(t * 1.7) * 0.1
    }
    if (holoGlow.current) holoGlow.current.material.opacity = 0.16 + Math.sin(t * 1.7) * 0.04
    const d = Math.min(dt, 0.05)
    glows.current.forEach((s, i) => {
      if (!s) return
      const target = hoverRef.current === HOTSPOTS[i].id ? 0.4 : 0.07
      s.material.opacity = THREE.MathUtils.damp(s.material.opacity, target, 6, d)
    })
  })

  const wall = <meshPhongMaterial color="#15151a" shininess={4} specular="#0c0c0e" />
  const screenRef = (i) => (el) => (screens.current[i] = el)

  // Six-screen status wall on the right wall, 3 × 2, facing into the room.
  const statusWall = [
    { z: -1.35, y: 2.65, map: tex.graph },
    { z: -0.6, y: 2.65, map: tex.dash },
    { z: 0.15, y: 2.65, map: tex.net },
    { z: -1.35, y: 2.05, map: tex.term },
    { z: -0.6, y: 2.05, map: tex.code },
    { z: 0.15, y: 2.05, map: tex.graph },
  ]

  return (
    <group>
      {/* ── shell ─────────────────────────────────────────────────────── */}
      <mesh rotation={[-PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshPhongMaterial color="#17171b" shininess={12} specular="#1e1e22" />
      </mesh>
      <mesh rotation={[PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshPhongMaterial color="#07070a" shininess={4} specular="#0c0c0e" />
      </mesh>
      <mesh position={[0, H / 2, -D / 2]}>
        <planeGeometry args={[W, H]} />
        {wall}
      </mesh>
      <mesh position={[0, H / 2, D / 2]} rotation={[0, PI, 0]}>
        <planeGeometry args={[W, H]} />
        {wall}
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} rotation={[0, PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        {wall}
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} rotation={[0, -PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        {wall}
      </mesh>
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0.01, -0.4]}>
        <planeGeometry args={[3.6, 2.4]} />
        <meshPhongMaterial color="#121710" shininess={4} specular="#0c0c0e" />
      </mesh>
      {/* ceiling light panels + cable tray along the back edge */}
      {[-2.4, 0, 2.4].map((x) => (
        <mesh key={x} rotation={[PI / 2, 0, 0]} position={[x, H - 0.01, -0.5]}>
          <planeGeometry args={[1.2, 0.3]} />
          <meshBasicMaterial color="#aab4c8" toneMapped={false} transparent opacity={0.28} />
        </mesh>
      ))}
      <mesh position={[0, H - 0.18, -D / 2 + 0.2]}>
        <boxGeometry args={[W - 0.4, 0.1, 0.3]} />
        <meshPhongMaterial color="#202026" shininess={45} specular="#55555c" />
      </mesh>
      {/* baseboard LED strips */}
      <Strip position={[0, 0.03, -D / 2 + 0.05]} size={[W - 0.2, 0.02, 0.03]} accent={accent} />
      <Strip position={[W / 2 - 0.05, 0.03, 0]} size={[0.03, 0.02, D - 0.2]} accent={accent} />
      <Strip position={[-W / 2 + 0.05, 0.03, 0]} size={[0.03, 0.02, D - 0.2]} accent={accent} />
      {/* ── vestibule: floor, ceiling and side walls past the front wall ── */}
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0, D / 2 + VESTIBULE / 2]}>
        <planeGeometry args={[W, VESTIBULE]} />
        <meshPhongMaterial color="#17171b" shininess={12} specular="#1e1e22" />
      </mesh>
      <mesh rotation={[PI / 2, 0, 0]} position={[0, H, D / 2 + VESTIBULE / 2]}>
        <planeGeometry args={[W, VESTIBULE]} />
        <meshPhongMaterial color="#07070a" shininess={4} specular="#0c0c0e" />
      </mesh>
      <mesh position={[-W / 2, H / 2, D / 2 + VESTIBULE / 2]} rotation={[0, PI / 2, 0]}>
        <planeGeometry args={[VESTIBULE, H]} />
        {wall}
      </mesh>
      <mesh position={[W / 2, H / 2, D / 2 + VESTIBULE / 2]} rotation={[0, -PI / 2, 0]}>
        <planeGeometry args={[VESTIBULE, H]} />
        {wall}
      </mesh>
      <Strip position={[W / 2 - 0.05, 0.03, D / 2 + VESTIBULE / 2]} size={[0.03, 0.02, VESTIBULE]} accent={accent} />
      <Strip position={[-W / 2 + 0.05, 0.03, D / 2 + VESTIBULE / 2]} size={[0.03, 0.02, VESTIBULE]} accent={accent} />

      {/* ── window + moon (back wall, right) ──────────────────────────── */}
      <mesh position={[2.4, 2.3, -3.46]}>
        <boxGeometry args={[2.4, 1.6, 0.08]} />
        <meshPhongMaterial color="#0c0c0f" shininess={12} specular="#1e1e22" />
      </mesh>
      <mesh position={[2.4, 2.3, -3.41]}>
        <planeGeometry args={[2.2, 1.4]} />
        <meshBasicMaterial map={tex.stars} toneMapped={false} />
      </mesh>
      <sprite position={[3.0, 2.6, -3.3]} scale={[1.5, 1.5, 1]}>
        <spriteMaterial map={glowMap} color="#cfe0ff" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <pointLight position={[2.4, 2.3, -3.0]} color="#9fb8ff" intensity={2} distance={8} decay={2} />

      {/* ── neon sign (right wall, above the status wall) ─────────────── */}
      <mesh position={[4.93, 3.35, -0.6]} rotation={[0, -PI / 2, 0]}>
        <planeGeometry args={[2.0, 0.5]} />
        <meshBasicMaterial map={tex.neon} transparent toneMapped={false} />
      </mesh>

      {/* ── desk + five-monitor array (projects) ──────────────────────── */}
      <mesh position={[-1.8, 0.95, -2.7]}>
        <boxGeometry args={[3.6, 0.08, 1.2]} />
        <meshPhongMaterial color={WOOD} shininess={12} specular="#1e1e22" />
      </mesh>
      {[[-3.5, -3.2], [-0.1, -3.2], [-3.5, -2.2], [-0.1, -2.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.47, z]}>
          <boxGeometry args={[0.06, 0.94, 0.06]} />
          <meshPhongMaterial color={METAL} shininess={45} specular="#55555c" />
        </mesh>
      ))}
      <Strip position={[-1.8, 0.9, -2.12]} size={[3.4, 0.015, 0.02]} accent={accent} />
      <pointLight position={[-1.8, 0.7, -2.0]} color={accent} intensity={1.2} distance={3} decay={2} />
      {/* lower row */}
      <Monitor position={[-1.8, 1.45, -3.0]} map={tex.code} screenRef={screenRef(0)} />
      <Monitor position={[-2.9, 1.42, -2.86]} rotation={[0, 0.4, 0]} map={tex.term} screenRef={screenRef(1)} />
      <Monitor position={[-0.7, 1.42, -2.86]} rotation={[0, -0.4, 0]} map={tex.dash} screenRef={screenRef(2)} />
      {/* upper row on arms, tilted down */}
      <mesh position={[-1.8, 1.9, -3.2]}>
        <boxGeometry args={[2.6, 0.05, 0.05]} />
        <meshPhongMaterial color={METAL} shininess={45} specular="#55555c" />
      </mesh>
      <Monitor position={[-2.4, 2.18, -3.1]} rotation={[0.18, 0.12, 0]} size={[1.0, 0.56]} map={tex.graph} mount="arm" screenRef={screenRef(3)} />
      <Monitor position={[-1.2, 2.18, -3.1]} rotation={[0.18, -0.12, 0]} size={[1.0, 0.56]} map={tex.net} mount="arm" screenRef={screenRef(4)} />
      {/* desk props: keyboard, mouse, laptop, mug, mic arm */}
      <mesh position={[-1.9, 1.01, -2.3]}>
        <boxGeometry args={[0.9, 0.03, 0.3]} />
        <meshPhongMaterial color={METAL} shininess={12} specular="#1e1e22" />
      </mesh>
      <mesh position={[-1.25, 1.01, -2.3]}>
        <boxGeometry args={[0.1, 0.03, 0.16]} />
        <meshPhongMaterial color={METAL} shininess={12} specular="#1e1e22" />
      </mesh>
      <group position={[-3.25, 1.0, -2.45]} rotation={[0, 0.35, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.02, 0.42]} />
          <meshPhongMaterial color="#26262c" shininess={45} specular="#55555c" />
        </mesh>
        <mesh position={[0, 0.2, -0.2]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.6, 0.4, 0.02]} />
          <meshPhongMaterial color="#26262c" shininess={45} specular="#55555c" />
        </mesh>
        <mesh position={[0, 0.2, -0.187]} rotation={[-0.3, 0, 0]}>
          <planeGeometry args={[0.54, 0.34]} />
          <meshBasicMaterial map={tex.term} toneMapped={false} transparent />
        </mesh>
      </group>
      <mesh position={[-0.35, 1.06, -2.4]}>
        <cylinderGeometry args={[0.06, 0.05, 0.14, 12]} />
        <meshPhongMaterial color="#e8e0d0" shininess={4} specular="#0c0c0e" />
      </mesh>
      <mesh position={[-0.1, 1.35, -2.9]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
        <meshPhongMaterial color={METAL} shininess={45} specular="#55555c" />
      </mesh>
      <mesh position={[-0.28, 1.62, -2.9]}>
        <cylinderGeometry args={[0.05, 0.05, 0.14, 12]} />
        <meshPhongMaterial color="#111114" shininess={12} specular="#1e1e22" />
      </mesh>
      <pointLight position={[-1.8, 1.6, -2.4]} color={accent} intensity={2.2} distance={5} decay={2} />
      {/* chair */}
      <group position={[-1.8, 0, -1.7]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
          <meshPhongMaterial color={METAL} shininess={45} specular="#55555c" />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshPhongMaterial color="#2a2a30" shininess={45} specular="#55555c" />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.08, 16]} />
          <meshPhongMaterial color="#17171b" shininess={4} specular="#0c0c0e" />
        </mesh>
        <mesh position={[0, 1.12, -0.26]}>
          <boxGeometry args={[0.56, 0.62, 0.06]} />
          <meshPhongMaterial color="#17171b" shininess={4} specular="#0c0c0e" />
        </mesh>
      </group>

      {/* ── holo display by the window ────────────────────────────────── */}
      <group position={[3.6, 0, -2.4]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.28, 0.34, 1.0, 20]} />
          <meshPhongMaterial color={METAL} shininess={45} specular="#55555c" />
        </mesh>
        <mesh position={[0, 1.01, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 20]} />
          <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.6} />
        </mesh>
        <mesh ref={holo} position={[0, 1.55, 0]}>
          <icosahedronGeometry args={[0.32, 1]} />
          <meshBasicMaterial color={accent} wireframe transparent opacity={0.5} toneMapped={false} />
        </mesh>
        <sprite ref={holoGlow} position={[0, 1.5, 0]} scale={[1.4, 1.4, 1]}>
          <spriteMaterial map={glowMap} color={accent} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      </group>

      {/* ── trophy shelf (achievements), above the monitor array ──────── */}
      <mesh position={[-1.8, 3.0, -3.3]}>
        <boxGeometry args={[1.9, 0.05, 0.3]} />
        <meshPhongMaterial color={WOOD} shininess={12} specular="#1e1e22" />
      </mesh>
      {[[-2.35, 0.3], [-1.8, 0.42], [-1.25, 0.3]].map(([x, h], i) => (
        <group key={i} position={[x, 3.025, -3.3]}>
          <mesh position={[0, h / 2, 0]}>
            <cylinderGeometry args={[0.07, 0.05, h, 12]} />
            <meshPhongMaterial color="#c9a24a" shininess={90} specular="#9a9aa4" />
          </mesh>
          <mesh position={[0, h + 0.05, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshPhongMaterial color="#d8b25c" shininess={90} specular="#9a9aa4" />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.9, 3.22, -3.3]}>
        <boxGeometry args={[0.3, 0.38, 0.03]} />
        <meshPhongMaterial color="#e8e0d0" shininess={4} specular="#0c0c0e" />
      </mesh>

      {/* ── bookshelf (about), left wall back ─────────────────────────── */}
      <mesh position={[-4.95, 1.3, -1.2]}>
        <boxGeometry args={[0.04, 2.6, 1.6]} />
        <meshPhongMaterial color={WOOD} shininess={12} specular="#1e1e22" />
      </mesh>
      {[-2.0, -0.4].map((z, i) => (
        <mesh key={i} position={[-4.78, 1.3, z]}>
          <boxGeometry args={[0.35, 2.6, 0.04]} />
          <meshPhongMaterial color={WOOD} shininess={12} specular="#1e1e22" />
        </mesh>
      ))}
      {[0.3, 0.95, 1.6, 2.25].map((y, i) => (
        <group key={i}>
          <mesh position={[-4.78, y, -1.2]}>
            <boxGeometry args={[0.35, 0.04, 1.6]} />
            <meshPhongMaterial color={WOOD} shininess={12} specular="#1e1e22" />
          </mesh>
          <Books y={y + 0.02} accent={accent} />
        </group>
      ))}

      {/* ── corkboard (journey), left wall front ──────────────────────── */}
      <mesh position={[-4.96, 2.2, 1.3]}>
        <boxGeometry args={[0.04, 1.1, 1.6]} />
        <meshPhongMaterial color="#3a2d22" shininess={4} specular="#0c0c0e" />
      </mesh>
      {[[2.45, 0.75], [2.1, 1.1], [2.5, 1.5], [1.95, 1.7], [2.3, 1.95]].map(([y, z], i) => (
        <group key={i}>
          <mesh position={[-4.93, y, z]} rotation={[0, PI / 2, (i % 2 ? 1 : -1) * 0.06]}>
            <planeGeometry args={[0.26, 0.2]} />
            <meshPhongMaterial color={i === 2 ? accent : "#e8e0d0"} shininess={4} specular="#0c0c0e" />
          </mesh>
          <mesh position={[-4.92, y + 0.09, z]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshPhongMaterial color={accent} emissive={accent} emissiveIntensity={0.5} shininess={12} specular="#1e1e22" />
          </mesh>
        </group>
      ))}

      {/* ── twin server racks (skills), right wall back ───────────────── */}
      <Rack position={[4.55, 1.0, -2.9]} leds={leds} offset={0} accent={accent} />
      <Rack position={[4.55, 1.0, -2.05]} leds={leds} offset={32} accent={accent} />
      <mesh position={[4.55, 2.08, -2.47]}>
        <boxGeometry args={[0.6, 0.06, 1.6]} />
        <meshPhongMaterial color="#202026" shininess={45} specular="#55555c" />
      </mesh>

      {/* ── six-screen status wall (stats), right wall ────────────────── */}
      {statusWall.map((s, i) => (
        <Monitor
          key={i}
          position={[4.92, s.y, s.z]}
          rotation={[0, -PI / 2, 0]}
          size={[0.68, 0.5]}
          map={s.map}
          mount="arm"
          screenRef={screenRef(5 + i)}
        />
      ))}

      {/* ── guitar (beyond code), right wall front ────────────────────── */}
      <group position={[4.9, 2.3, 1.1]} rotation={[0, 0, PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.28, 0.28, 0.08, 24]} />
          <meshPhongMaterial color="#5a3a22" shininess={12} specular="#1e1e22" />
        </mesh>
        <mesh position={[-0.32, 0, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.08, 24]} />
          <meshPhongMaterial color="#5a3a22" shininess={12} specular="#1e1e22" />
        </mesh>
        <mesh position={[0, 0.045, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
          <meshPhongMaterial color="#1a1410" shininess={4} specular="#0c0c0e" />
        </mesh>
      </group>
      <mesh position={[4.9, 3.0, 1.1]}>
        <boxGeometry args={[0.05, 0.95, 0.09]} />
        <meshPhongMaterial color={WOOD} shininess={12} specular="#1e1e22" />
      </mesh>
      <mesh position={[4.9, 3.52, 1.1]}>
        <boxGeometry args={[0.06, 0.2, 0.13]} />
        <meshPhongMaterial color="#1a1410" shininess={12} specular="#1e1e22" />
      </mesh>

      {/* ── arcade cabinet (play), right wall front ───────────────────── */}
      <mesh position={[4.5, 0.95, 2.3]}>
        <boxGeometry args={[0.75, 1.9, 0.8]} />
        <meshPhongMaterial color="#121215" shininess={12} specular="#1e1e22" />
      </mesh>
      <mesh position={[4.11, 1.55, 2.3]} rotation={[0, -PI / 2, 0]}>
        <planeGeometry args={[0.55, 0.45]} />
        <meshBasicMaterial map={tex.arcade} toneMapped={false} />
      </mesh>
      <mesh position={[4.02, 1.15, 2.3]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.3, 0.08, 0.7]} />
        <meshPhongMaterial color={METAL} shininess={12} specular="#1e1e22" />
      </mesh>
      <mesh position={[4.1, 1.95, 2.3]} rotation={[0, -PI / 2, 0]}>
        <planeGeometry args={[0.8, 0.16]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>

      {/* ── door (contact), front wall left ───────────────────────────
          Single-sided like the wall it sits in, so the dollhouse view from
          outside looks straight through it instead of at its back. */}
      <mesh position={[-2.5, 1.2, 3.44]} rotation={[0, PI, 0]}>
        <planeGeometry args={[1.2, 2.4]} />
        <meshPhongMaterial color="#0c0c0f" shininess={12} specular="#1e1e22" />
      </mesh>
      <mesh position={[-2.5, 1.1, 3.43]} rotation={[0, PI, 0]}>
        <planeGeometry args={[1.0, 2.2]} />
        <meshPhongMaterial color={WOOD} shininess={12} specular="#1e1e22" />
      </mesh>
      <mesh position={[-2.5, 2.55, 3.41]}>
        <planeGeometry args={[0.5, 0.14]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      {/* small terminal screen beside the door */}
      <Monitor position={[-1.5, 1.7, 3.42]} rotation={[0, PI, 0]} size={[0.5, 0.36]} map={tex.term} mount="arm" screenRef={screenRef(11)} />

      {/* ── floor lamp ────────────────────────────────────────────────── */}
      <mesh position={[1.2, 0.95, -1.6]}>
        <cylinderGeometry args={[0.02, 0.02, 1.9, 8]} />
        <meshPhongMaterial color="#2a2a30" shininess={45} specular="#55555c" />
      </mesh>
      <mesh position={[1.2, 2.0, -1.6]}>
        <coneGeometry args={[0.24, 0.32, 16, 1, true]} />
        <meshPhongMaterial color="#26262c" side={THREE.DoubleSide} shininess={12} specular="#1e1e22" />
      </mesh>
      <pointLight position={[1.2, 1.8, -1.6]} color="#ffd4a0" intensity={4} distance={7} decay={2} />

      {/* ── posters: rock bands + Barcelona ───────────────────────────── */}
      {POSTERS.map((p) => (
        <Poster key={p.key} pos={p.pos} rot={p.rot} size={p.size} map={posters[p.key]} />
      ))}

      {/* ── pointer targets: hover lights the door, click opens the page ── */}
      {HOTSPOTS.map((h) => {
        const hit = DOOR_HITS[h.id]
        if (!hit) return null
        return (
          <mesh
            key={`hit-${h.id}`}
            position={hit.at}
            onPointerOver={(e) => {
              e.stopPropagation()
              onHover?.(h.id)
            }}
            onPointerOut={() => onHover?.(null)}
            onClick={(e) => {
              e.stopPropagation()
              onOpen?.(h.id)
            }}
          >
            <boxGeometry args={hit.size} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )
      })}

      {/* ── hover glows on each door ──────────────────────────────────── */}
      {HOTSPOTS.map((h, i) => (
        <sprite key={h.id} ref={(el) => (glows.current[i] = el)} position={h.at} scale={[1.1, 1.1, 1]}>
          <spriteMaterial map={glowMap} color={accent} transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
