import { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  Float,
  Environment,
  Sparkles,
  MeshDistortMaterial,
  AdaptiveDpr,
} from "@react-three/drei"
import { usePrefersReducedMotion } from "../context/motion"

/** Reads global scroll progress (0 → 1), preferring Lenis if present. */
function getScrollProgress() {
  const lenis = window.__lenis
  if (lenis && typeof lenis.progress === "number") return lenis.progress
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? window.scrollY / max : 0
}

function DistortBlob() {
  const mesh = useRef()

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.getElapsedTime()
    const p = getScrollProgress()
    mesh.current.rotation.y = t * 0.15 + p * Math.PI * 3
    mesh.current.rotation.x = p * Math.PI
    mesh.current.position.y = -p * 1.5
    mesh.current.scale.setScalar(1.4 + p * 0.5)
  })

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1, 32]} />
        <MeshDistortMaterial
          color="#7c3aed"
          emissive="#4c1d95"
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.8}
          distort={0.35}
          speed={1.6}
        />
      </mesh>
    </Float>
  )
}

export default function ScrollScene() {
  const reduced = usePrefersReducedMotion()
  if (reduced) return null

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 3, 3]} intensity={1.4} />
          <DistortBlob />
          <Sparkles count={60} scale={8} size={2} speed={0.4} color="#c4b5fd" />
          <Environment preset="city" />
        </Suspense>
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  )
}
