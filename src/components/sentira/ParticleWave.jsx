import { useEffect, useRef } from "react"
import { useLowPower, usePrefersReducedMotion } from "../../context/motion"

/**
 * The dot-matrix terrain that anchors the hero and the closing CTA.
 *
 * The reference ships this as a pre-rendered image sequence; rendering it live
 * costs a canvas but buys two things a sprite cannot — it fills any viewport
 * width without letterboxing, and it keeps drifting, which is most of why the
 * hero reads as alive rather than as a screenshot.
 *
 * Construction is a perspective-projected grid. Rows march from a horizon line
 * toward the viewer; each row is spread wider and drawn larger than the one
 * behind it, and that alone is the 3D illusion — there is no matrix math and no
 * WebGL context. Height comes from three summed sines at incommensurate
 * frequencies, so the ridge line never visibly repeats.
 */

/** Ridge colour (--accent) and trough colour (--accent-deep), pre-split so the
 *  inner loop never re-parses a hex string. */
const RIDGE = [190, 228, 102]
const TROUGH = [54, 80, 38]

/**
 * Layered sines. The three frequencies share no common factor, so the surface
 * has a period far longer than any scroll session — it reads as noise without
 * costing a noise lookup.
 */
function surface(x, z, t) {
  return (
    Math.sin(x * 1.6 + t) * 0.5 +
    Math.sin(x * 0.7 - z * 2.1 + t * 0.6) * 0.35 +
    Math.sin(z * 3.4 + x * 0.4 + t * 0.4) * 0.2
  )
}

export default function ParticleWave({
  className = "",
  /** Vertical share of the canvas the terrain occupies, 0–1. */
  height = 1,
  /** Dims the whole field — the footer copy sits over a quieter version. */
  intensity = 1,
}) {
  const canvasRef = useRef(null)
  const lowPower = useLowPower()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // The field is drawn by writing pixels into an ImageData buffer rather than
    // by calling fillRect per dot. At the density the reference needs — tens of
    // thousands of dots a frame — the per-call cost of setting fillStyle and
    // issuing a rect dominates everything else and caps the whole thing around
    // 20fps. Packing a colour into one Uint32 and storing it directly is roughly
    // two orders of magnitude cheaper, and it is what lets the matrix be dense
    // enough to read as a surface instead of as scattered dots.
    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5)

    // A phone draws a much coarser matrix. It still reads correctly — it just
    // becomes grainier, which suits the aesthetic.
    const COLS = lowPower ? 150 : 330
    const ROWS = lowPower ? 70 : 190

    let w = 0
    let h = 0
    let pw = 0 // buffer dimensions, in device pixels
    let ph = 0
    let image = null
    let buf32 = null
    let raf = 0
    let running = true

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      pw = Math.max(1, Math.round(w * dpr))
      ph = Math.max(1, Math.round(h * dpr))
      canvas.width = pw
      canvas.height = ph
      // putImageData ignores the transform, so the buffer is addressed in
      // device pixels throughout and dpr is folded into the projection instead.
      image = ctx.createImageData(pw, ph)
      buf32 = new Uint32Array(image.data.buffer)
    }
    resize()

    const draw = (time) => {
      const t = reduced ? 0 : time * 0.00022

      // One memset beats clearRect plus a fresh allocation each frame.
      buf32.fill(0)

      const terrainTop = ph * (1 - height)
      const span = ph - terrainTop

      // Columns are evenly spaced in *screen* space rather than projected from
      // world space. A true projection fans the near rows to several times the
      // viewport width, which both wastes the loop on off-screen dots and bends
      // the field into a fisheye bowl. Uniform columns keep the matrix regular —
      // which is what the reference actually looks like — and leave the illusion
      // of depth to row spacing, amplitude, dot size and light alone.
      const colStep = pw / (COLS - 1)

      for (let r = 0; r < ROWS; r++) {
        const depth = r / (ROWS - 1)
        // Row crowding toward the horizon. 2.2 is gentler than a cube: at 3 the
        // far half collapses into a solid band with no readable ridges.
        const persp = Math.pow(depth, 2.2)

        const rowY = terrainTop + persp * span
        // Dots grow with proximity, and round to whole device pixels so a dot is
        // a crisp square rather than a smeared one.
        const dotSize = Math.max(1, Math.round((0.7 + persp * 2.2) * dpr))
        // Near ridges swing far more than distant ones — this single term is
        // most of the depth cue. Kept well under half the span: past that the
        // crests stop reading as hills and start reading as one large wave.
        const amp = span * (0.04 + persp * 0.4)

        // Sampling depth for the surface, and the step used to difference
        // against the row behind.
        const zw = persp * 3.4
        const dz = 0.16

        // Distant rows fade up into the page background; the nearest rows fade
        // again so the field dissolves at the bottom edge instead of being cut.
        const depthFade = Math.min(1, persp * 2.6)
        const edgeFade = 1 - Math.max(0, (persp - 0.9) / 0.1) * 0.55
        const rowFade = depthFade * edgeFade * intensity
        if (rowFade <= 0.02) continue

        for (let c = 0; c < COLS; c++) {
          const xNorm = (c / (COLS - 1)) * 2 - 1
          // 4.6 puts roughly three crests across the viewport, matching the
          // reference's rolling-hills read; lower values give one flat arc.
          const xw = xNorm * 4.6

          const elev = surface(xw, zw, t)
          const y = rowY - elev * amp
          if (y < 0 || y >= ph) continue

          // Lighting, not height, is what picks out the crests in the
          // reference. Differencing against the row behind approximates the
          // surface normal in z, so slopes tilted toward the viewer catch the
          // light and the far faces fall into the deep green — the same read as
          // sun across a hillside.
          const slope = elev - surface(xw, zw - dz, t)
          let lit = 0.42 + slope * 3.8 + elev * 0.24
          lit = lit < 0 ? 0 : lit > 1 ? 1 : lit
          const glow = lit * lit

          // Horizontal vignette — the reference is brightest through the centre.
          const sideFade = 1 - Math.abs(xNorm) * 0.3

          // Fade by screen position, not by row index. Because amplitude
          // displaces a dot off its row, the topmost dots on a crest can belong
          // to a row that is otherwise fully faded in — fading by row alone
          // leaves a hard horizontal seam where the canvas begins.
          const topFade = Math.min(1, (y - terrainTop) / (span * 0.42))
          if (topFade <= 0) continue

          let alpha = rowFade * sideFade * topFade * (0.28 + glow * 1.45)
          if (alpha <= 0.02) continue
          if (alpha > 1) alpha = 1

          const rr = (TROUGH[0] + (RIDGE[0] - TROUGH[0]) * glow) | 0
          const gg = (TROUGH[1] + (RIDGE[1] - TROUGH[1]) * glow) | 0
          const bb = (TROUGH[2] + (RIDGE[2] - TROUGH[2]) * glow) | 0
          // Little-endian ABGR — the byte order Uint32 writes land in.
          const packed =
            ((alpha * 255) << 24) | (bb << 16) | (gg << 8) | rr

          const x0 = (c * colStep) | 0
          const y0 = y | 0
          const x1 = x0 + dotSize > pw ? pw : x0 + dotSize
          const y1 = y0 + dotSize > ph ? ph : y0 + dotSize

          for (let py = y0; py < y1; py++) {
            const row = py * pw
            for (let px = x0; px < x1; px++) {
              // Nearer rows are drawn later and simply overwrite — which is the
              // correct occlusion order for a heightfield viewed from the front.
              buf32[row + px] = packed
            }
          }
        }
      }

      ctx.putImageData(image, 0, 0)
    }

    const loop = (time) => {
      if (!running) return
      draw(time)
      raf = requestAnimationFrame(loop)
    }

    // A static field still needs one paint; an animated one needs the loop.
    if (reduced) {
      draw(0)
    } else {
      raf = requestAnimationFrame(loop)
    }

    // Stop the loop whenever the terrain is off-screen. The hero scrolls away
    // early and the footer is unreached for most of the page — without this the
    // canvas would burn a frame budget nobody is looking at.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduced) return
        if (entry.isIntersecting && !running) {
          running = true
          raf = requestAnimationFrame(loop)
        } else if (!entry.isIntersecting && running) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { rootMargin: "120px" }
    )
    io.observe(canvas)

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) draw(0)
    })
    ro.observe(canvas)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [lowPower, reduced, height, intensity])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block h-full w-full ${className}`}
    />
  )
}
