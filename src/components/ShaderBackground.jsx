import { Suspense, lazy, useEffect, useState } from "react"

/**
 * Desktop-only WebGL backdrop.
 *
 * The scene is a separate chunk behind a dynamic import: three.js and
 * @react-three/fiber are ~1MB of JS, and statically importing them put that
 * cost on every phone that loads the site even though the canvas never renders
 * there. Now the import only fires once the media query passes.
 */
const ShaderScene = lazy(() => import("./ShaderScene"))

export default function ShaderBackground() {
  const [enabled, setEnabled] = useState(false)

  // The shader is desktop candy: skip the WebGL canvas entirely on touch,
  // small screens, and reduced motion — InteractiveGrid still paints the bg.
  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    )
    const update = () => setEnabled(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  if (!enabled) return null

  return (
    <Suspense fallback={null}>
      <ShaderScene />
    </Suspense>
  )
}
