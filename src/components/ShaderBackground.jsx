import { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uMouseVelocity;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = uv;
    p.x *= aspect;

    vec2 mouse = uMouse;
    mouse.x *= aspect;

    // Distance to mouse
    float dist = length(p - mouse);
    
    // Warp effect based on mouse distance and velocity
    float warpForce = smoothstep(0.4, 0.0, dist) * uMouseVelocity * 0.3;
    vec2 warpDir = normalize(p - mouse);
    vec2 warpedUv = p - warpDir * warpForce; // Pull towards cursor

    // Create grid
    float gridSize = 20.0;
    vec2 grid = fract(warpedUv * gridSize - vec2(uTime * 0.5, uTime * 0.2));
    
    // Grid lines thickness
    float lineThickness = 0.03;
    float linesX = smoothstep(lineThickness, 0.0, grid.x) + smoothstep(1.0 - lineThickness, 1.0, grid.x);
    float linesY = smoothstep(lineThickness, 0.0, grid.y) + smoothstep(1.0 - lineThickness, 1.0, grid.y);
    float lines = max(linesX, linesY);
    
    // Neon lime glow effect based on velocity and proximity
    vec3 glowColor = vec3(0.64, 0.9, 0.15); // Neon lime #A3E635
    vec3 baseGridColor = vec3(0.15, 0.15, 0.18);
    vec3 bg = vec3(0.02, 0.02, 0.02);
    
    float glowIntensity = smoothstep(0.6, 0.0, dist) * clamp(uMouseVelocity * 1.5, 0.0, 2.0);
    
    vec3 gridColor = mix(baseGridColor, glowColor, glowIntensity + 0.1);
    
    vec3 col = mix(bg, gridColor, lines);
    
    // Add soft glow around cursor
    col += glowColor * smoothstep(0.3, 0.0, dist) * (0.1 + uMouseVelocity * 0.2);

    gl_FragColor = vec4(col, 1.0);
  }
`

function ShaderMesh() {
  const meshRef = useRef()
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const velocityTarget = useRef(0)
  const lastMousePos = useRef(new THREE.Vector2(0.5, 0.5))
  const lastTime = useRef(0)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseVelocity: { value: 0 },
    }),
    []
  )

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime()
      uniforms.uMouseVelocity.value += (velocityTarget.current - uniforms.uMouseVelocity.value) * 0.1
      velocityTarget.current *= 0.95 // decay
    }
  })

  useMemo(() => {
    const handleResize = () => {
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
    }
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth
      const y = 1.0 - e.clientY / window.innerHeight
      
      const now = performance.now()
      const dt = now - lastTime.current
      
      if (dt > 0 && lastTime.current > 0) {
        const dx = x - lastMousePos.current.x
        const dy = y - lastMousePos.current.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        velocityTarget.current = Math.min(dist / dt * 500, 3.0) // Normalize velocity
      }
      
      lastMousePos.current.set(x, y)
      lastTime.current = now
      mouseRef.current.set(x, y)
      uniforms.uMouse.value.copy(mouseRef.current)
    }
    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [uniforms])

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

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
    <div className="fixed inset-0 -z-20" style={{ opacity: 0.6 }}>
      <Canvas
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ width: "100%", height: "100%" }}
      >
        <ShaderMesh />
      </Canvas>
    </div>
  )
}
