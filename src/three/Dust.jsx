import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const COUNT = 140

/** Slow-drifting motes for depth; they streak briefly on a section cut. */
export default function Dust({ tracker, accent }) {
  const points = useRef()
  const positions = useMemo(() => {
    const a = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      a[i * 3] = (Math.random() - 0.5) * 9
      a[i * 3 + 1] = Math.random() * 3.6 + 0.2
      a[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return a
  }, [])
  const color = useMemo(() => accent.clone().lerp(new THREE.Color("#ffffff"), 0.55), [accent])

  useFrame(({ clock }, dt) => {
    const p = points.current
    if (!p) return
    const t = clock.getElapsedTime()
    const since = (performance.now() - tracker.current.changedAt) / 1000
    const streak = tracker.current.changedAt ? Math.exp(-since * 3.5) : 0
    p.position.y = Math.sin(t * 0.12) * 0.15
    p.position.z = THREE.MathUtils.damp(p.position.z, streak * 1.2, 4, Math.min(dt, 0.05))
    p.material.size = 0.025 + streak * 0.03
    p.material.opacity = 0.28 + streak * 0.25
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.025} sizeAttenuation transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}
