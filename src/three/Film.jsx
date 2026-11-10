import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, NoiseEffect, RenderPass, VignetteEffect } from "postprocessing"

/**
 * The film look (walk mode only): bloom on everything that emits light,
 * a moving grain and a lens vignette.
 *
 * It only exists where the room is actually seen. Under page copy the stage
 * sits at a tenth of its brightness, so every frame there renders straight
 * to the screen and costs what it did before; as the stage comes up to full
 * brightness (the map, a cut's fly) the effects ramp in with it.
 *
 * The two paths are not pixel-identical even with the effects at zero:
 * opaque surfaces match (no tone mapping on either), but transparent glows
 * blend in linear light inside the composer and in display space on screen,
 * so they come out brighter composited. The hand-over therefore happens low
 * in the stage's fade (HANDOVER), where that difference is lost in the fade.
 *
 * Owns rendering: a priority-1 frame callback, so R3F's own render is off.
 */
const PEAK = { bloom: 1.1, grain: 0.32, vignette: 0.62 }
/** Stage brightness above which frames go through the composer. */
const HANDOVER = 0.2
/** Stage brightness at which the effects start, and where they are full. */
const RAMP = [0.55, 0.95]

export default function Film({ level }) {
  const { gl, scene, camera, size } = useThree()
  const dpr = useThree((s) => s.viewport.dpr)
  const warm = useRef(2)

  const fx = useMemo(() => {
    const composer = new EffectComposer(gl, { multisampling: 4, frameBufferType: THREE.HalfFloatType })
    const bloom = new BloomEffect({
      mipmapBlur: true,
      luminanceThreshold: 0.42,
      luminanceSmoothing: 0.3,
      intensity: 0,
      radius: 0.78,
    })
    const vignette = new VignetteEffect({ offset: 0.28, darkness: 0 })
    const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY })
    grain.blendMode.opacity.value = 0
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(new EffectPass(camera, bloom, vignette, grain))
    return { composer, bloom, vignette, grain }
  }, [gl, scene, camera])

  useEffect(() => {
    fx.composer.setSize(size.width, size.height)
  }, [fx, size, dpr])

  // The composer renders the scene into a float buffer, which needs its own
  // build of every material's shader (linear output, not sRGB). Build them
  // in the background now, so the first map view doesn't stall on them.
  useEffect(() => {
    const prev = gl.getRenderTarget()
    gl.setRenderTarget(fx.composer.inputBuffer)
    gl.compileAsync?.(scene, camera).catch(() => {})
    gl.setRenderTarget(prev)
  }, [gl, scene, camera, fx])

  useEffect(() => () => fx.composer.dispose(), [fx])

  useFrame((_, dt) => {
    // The first frames always go through the composer (the stage is still
    // fading in from nothing) so its own passes compile before they're needed.
    if (level.current < HANDOVER && warm.current <= 0) {
      gl.render(scene, camera)
      return
    }
    warm.current--
    const s = THREE.MathUtils.smoothstep(level.current, RAMP[0], RAMP[1])
    fx.bloom.intensity = s * PEAK.bloom
    fx.vignette.darkness = s * PEAK.vignette
    fx.grain.blendMode.opacity.value = s * PEAK.grain
    fx.composer.render(dt)
  }, 1)

  return null
}
