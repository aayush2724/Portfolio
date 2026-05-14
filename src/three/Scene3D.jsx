import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  Stars,
} from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

function CinematicShapes({ mouse }) {
  const groupRef = useRef();
  const orbRef = useRef();
  const ringARef = useRef();
  const ringBRef = useRef();
  const ringCRef = useRef();
  const torusRef = useRef();
  const obeliskRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const scroll = window.scrollY / Math.max(1, window.innerHeight);

    state.camera.position.y = -scroll * 1.1;
    state.camera.rotation.x = -scroll * 0.04;

    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (mouse.current.x * 0.25 - groupRef.current.rotation.y) * 0.02;
      groupRef.current.rotation.x +=
        (-mouse.current.y * 0.18 - groupRef.current.rotation.x) * 0.02;
    }

    if (orbRef.current) {
      orbRef.current.rotation.y = t * 0.08;
      orbRef.current.rotation.x = t * 0.04;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.12;
      torusRef.current.rotation.y = t * 0.07;
    }
    if (ringARef.current) ringARef.current.rotation.z = t * 0.05;
    if (ringBRef.current) ringBRef.current.rotation.z = -t * 0.03;
    if (ringCRef.current) ringCRef.current.rotation.z = t * 0.018;
    if (obeliskRef.current) {
      obeliskRef.current.rotation.y = t * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.55}>
        <mesh ref={orbRef} position={[0, 0.2, -2.8]}>
          <icosahedronGeometry args={[1.4, 8]} />
          <MeshTransmissionMaterial
            color="#fafafa"
            transmission={0.98}
            roughness={0.08}
            thickness={0.9}
            ior={1.45}
            chromaticAberration={0.08}
            backside
            distortion={0.08}
            distortionScale={0.25}
            temporalDistortion={0.05}
            anisotropy={0.3}
            attenuationColor="#1a1a22"
            attenuationDistance={1.2}
          />
        </mesh>
      </Float>

      <Float speed={0.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={torusRef} position={[6.4, 1.4, -5]}>
          <torusGeometry args={[1.1, 0.025, 32, 160]} />
          <meshStandardMaterial
            color="#c9bfa9"
            roughness={0.18}
            metalness={1}
            emissive="#1a120a"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>

      <Float speed={0.35} rotationIntensity={0.05} floatIntensity={0.35}>
        <mesh ref={obeliskRef} position={[-6.8, -0.4, -6]}>
          <cylinderGeometry args={[0.05, 0.18, 3.6, 6]} />
          <meshStandardMaterial
            color="#2a2a30"
            roughness={0.4}
            metalness={0.9}
            emissive="#f59e0b"
            emissiveIntensity={0.05}
          />
        </mesh>
      </Float>

      <mesh ref={ringARef} position={[0, 0, -3]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[3.2, 0.004, 16, 220]} />
        <meshBasicMaterial color="#f5e6c8" transparent opacity={0.35} />
      </mesh>

      <mesh ref={ringBRef} position={[0, 0, -3]} rotation={[Math.PI / 2.8, 0.2, 0]}>
        <torusGeometry args={[4.6, 0.003, 16, 220]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
      </mesh>

      <mesh ref={ringCRef} position={[0, 0, -3]} rotation={[Math.PI / 1.7, -0.4, 0]}>
        <torusGeometry args={[6, 0.0025, 16, 240]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

function CinematicLights() {
  return (
    <>
      <ambientLight intensity={0.18} color="#1a1820" />
      <spotLight
        position={[8, 9, 4]}
        angle={0.35}
        penumbra={0.85}
        intensity={2.6}
        color="#fde7c2"
        distance={28}
        decay={1.5}
        castShadow={false}
      />
      <spotLight
        position={[-7, -4, -1]}
        angle={0.6}
        penumbra={1}
        intensity={1.1}
        color="#a8b8d8"
        distance={22}
        decay={1.6}
      />
      <pointLight position={[0, 0, -6]} intensity={1.6} color="#f59e0b" distance={9} />
      <pointLight position={[2, 3, 3]} intensity={0.6} color="#ffffff" distance={6} />
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
        camera={{ position: [0, 0, 7], fov: 50 }}
      >
        <color attach="background" args={["#050507"]} />
        <fog attach="fog" args={["#050507", 7, 22]} />
        <CinematicLights />
        <Stars
          radius={70}
          depth={60}
          count={1400}
          factor={2.4}
          saturation={0}
          fade
          speed={0.35}
        />
        <CinematicShapes mouse={mouse} />
      </Canvas>
    </div>
  );
}
