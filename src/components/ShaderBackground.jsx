import { useRef, useMemo } from "react"
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
  varying vec2 vUv;

  vec3 palette(float t) {
    vec3 a = vec3(0.04, 0.04, 0.04);
    vec3 b = vec3(0.0, 0.0, 0.0);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.83, 1.0, 0.25);
    return a + b * cos(6.28318 * (c * t + d));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = uv;
    p.x *= aspect;

    vec2 mouse = uMouse;
    mouse.x *= aspect;

    float t = uTime * 0.15;

    vec2 q = vec2(0.0);
    q.x = fbm(p + vec2(0.0, 0.0) + t * 0.3);
    q.y = fbm(p + vec2(5.2, 1.3) + t * 0.2);

    vec2 r = vec2(0.0);
    r.x = fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.15);
    r.y = fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.126);

    float f = fbm(p + 4.0 * r);

    vec3 col = palette(f * 0.8);

    float vignette = 1.0 - smoothstep(0.4, 1.4, length((uv - 0.5) * vec2(aspect, 1.0)));
    col *= vignette;

    float mouseDist = length(uv - mouse);
    float mouseInfluence = smoothstep(0.3, 0.0, mouseDist);
    col += vec3(0.83, 1.0, 0.25) * mouseInfluence * 0.08;

    col = pow(col, vec3(0.85));

    gl_FragColor = vec4(col, 1.0);
  }
`

function ShaderMesh() {
  const meshRef = useRef()
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  )

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  useMemo(() => {
    const handleResize = () => {
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
    }
    const handleMouseMove = (e) => {
      mouseRef.current.set(e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight)
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
