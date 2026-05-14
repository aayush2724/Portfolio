import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Stars,
  Sparkles,
} from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

function FloatingShapes({ mouse }) {
  const groupRef = useRef();
  const knotRef = useRef();
  const sphereRef = useRef();
  const icosaRef = useRef();
  const torusRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const scroll = window.scrollY / Math.max(1, window.innerHeight);

    state.camera.position.y = -scroll * 1.4;
    state.camera.rotation.x = -scroll * 0.06;

    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (mouse.current.x * 0.4 - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x +=
        (-mouse.current.y * 0.3 - groupRef.current.rotation.x) * 0.04;
    }

    if (knotRef.current) {
      knotRef.current.rotation.x = t * 0.3;
      knotRef.current.rotation.y = t * 0.22;
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.18;
      sphereRef.current.position.y = 0.6 + Math.sin(t * 0.8) * 0.25;
    }
    if (icosaRef.current) {
      icosaRef.current.rotation.x = -t * 0.4;
      icosaRef.current.rotation.z = t * 0.25;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.5;
      torusRef.current.rotation.y = t * 0.35;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
        <mesh ref={sphereRef} position={[-3.2, 0.8, -1]}>
          <icosahedronGeometry args={[1.4, 8]} />
          <MeshDistortMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.35}
            roughness={0.15}
            metalness={0.85}
            distort={0.45}
            speed={1.8}
          />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={1.4} floatIntensity={1.6}>
        <mesh ref={knotRef} position={[3.3, -0.4, -2]}>
          <torusKnotGeometry args={[0.75, 0.22, 200, 32]} />
          <MeshWobbleMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.9}
            factor={0.4}
            speed={2}
          />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={1} floatIntensity={1.4}>
        <mesh ref={icosaRef} position={[2.3, 2.4, -4]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#06b6d4"
            wireframe
            transparent
            opacity={0.55}
          />
        </mesh>
      </Float>

      <Float speed={2.6} rotationIntensity={1} floatIntensity={1.8}>
        <mesh ref={torusRef} position={[-3.4, -2.2, -3]}>
          <torusGeometry args={[0.6, 0.18, 24, 80]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={1}
          />
        </mesh>
      </Float>

      <mesh ref={ringRef} position={[0, 0, -6]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[5.4, 0.012, 16, 200]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.45} />
      </mesh>

      <mesh position={[0, 0, -6]} rotation={[Math.PI / 1.8, 0.4, 0]}>
        <torusGeometry args={[3.6, 0.008, 16, 160]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#fde68a" />
      <pointLight position={[-5, -3, -2]} intensity={1.4} color="#a855f7" />
      <pointLight position={[5, 4, -2]} intensity={1.1} color="#06b6d4" />
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#f59e0b" />
    </>
  );
}

export default function Scene3D() {
  const mouse = useRef({ x: 0, y: 0 });
  const [supportsWebGL, setSupportsWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      if (!gl) setSupportsWebGL(false);
    } catch {
      setSupportsWebGL(false);
    }

    const onMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!supportsWebGL) return null;

  return (
    <div
      data-testid="scene-3d-bg"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Canvas
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 7], fov: 55 }}
      >
        <color attach="background" args={["#04040a"]} />
        <fog attach="fog" args={["#04040a", 8, 18]} />
        <Lights />
        <Stars radius={50} depth={50} count={2000} factor={3} saturation={0} fade speed={0.7} />
        <Sparkles
          count={80}
          size={2.4}
          scale={[14, 10, 8]}
          speed={0.4}
          color="#fbbf24"
          opacity={0.5}
        />
        <Sparkles
          count={60}
          size={1.6}
          scale={[12, 12, 8]}
          speed={0.6}
          color="#a855f7"
          opacity={0.4}
        />
        <FloatingShapes mouse={mouse} />
      </Canvas>
    </div>
  );
}
