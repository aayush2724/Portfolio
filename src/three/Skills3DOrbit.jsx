import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Text,
  Center,
  Sparkles,
  OrbitControls,
} from "@react-three/drei";
import { useRef } from "react";

function SkillNode({ angle, radius, speed, color, label, offset, size = 0.45 }) {
  const ref = useRef();
  const labelRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime * speed + offset;
    if (ref.current) {
      ref.current.position.x = Math.cos(time + angle) * radius;
      ref.current.position.z = Math.sin(time + angle) * radius;
      ref.current.position.y = Math.sin(time * 0.7) * 0.4;
      ref.current.rotation.y += 0.01;
    }
    if (labelRef.current && ref.current) {
      labelRef.current.position.copy(ref.current.position);
      labelRef.current.position.y += size + 0.35;
      labelRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <>
      <Float speed={2} rotationIntensity={0.8} floatIntensity={0.6}>
        <mesh ref={ref}>
          <icosahedronGeometry args={[size, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.85}
          />
        </mesh>
      </Float>
      <group ref={labelRef}>
        <Center>
          <Text
            fontSize={0.18}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor={color}
          >
            {label}
          </Text>
        </Center>
      </group>
    </>
  );
}

function CentralCore() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    ref.current.rotation.x = state.clock.elapsedTime * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={0.6}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.05, 8]} />
        <meshPhysicalMaterial
          color="#f59e0b"
          transmission={0.95}
          roughness={0.05}
          thickness={0.6}
          ior={1.3}
          transparent
        />
      </mesh>
    </Float>
  );
}

function OrbitRings() {
  return (
    <>
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.4, 0.008, 16, 200]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2.7, 0.3, 0]}>
        <torusGeometry args={[3.4, 0.006, 16, 200]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, -0.4, 0]}>
        <torusGeometry args={[4.2, 0.005, 16, 200]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

const skills = [
  { label: "JS", color: "#facc15", radius: 2.4, speed: 0.35, angle: 0 },
  { label: "React", color: "#06b6d4", radius: 2.4, speed: 0.35, angle: 2.09 },
  { label: "Node", color: "#22c55e", radius: 2.4, speed: 0.35, angle: 4.18 },
  { label: "Python", color: "#a855f7", radius: 3.4, speed: 0.22, angle: 0.8 },
  { label: "C++", color: "#f59e0b", radius: 3.4, speed: 0.22, angle: 3.0 },
  { label: "TS", color: "#3b82f6", radius: 3.4, speed: 0.22, angle: 5.2 },
  { label: "Mongo", color: "#22c55e", radius: 4.2, speed: 0.15, angle: 0.5, size: 0.32 },
  { label: "SQL", color: "#ec4899", radius: 4.2, speed: 0.15, angle: 2.5, size: 0.32 },
  { label: "Git", color: "#f97316", radius: 4.2, speed: 0.15, angle: 4.5, size: 0.32 },
];

export default function Skills3DOrbit() {
  return (
    <div
      data-testid="skills-3d-orbit"
      className="relative h-[460px] w-full overflow-hidden rounded-3xl border border-white/8 gc"
    >
      <Canvas
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.8, 6.5], fov: 55 }}
      >
        <ambientLight intensity={0.55} />
        <pointLight position={[5, 5, 5]} intensity={1.4} color="#fde68a" />
        <pointLight position={[-5, -3, -2]} intensity={1} color="#a855f7" />
        <pointLight position={[0, 0, 0]} intensity={2.4} color="#f59e0b" distance={4} />
        <Sparkles count={60} size={2} scale={[8, 6, 6]} speed={0.4} color="#fbbf24" />
        <CentralCore />
        <OrbitRings />
        {skills.map((skill, index) => (
          <SkillNode key={skill.label} {...skill} offset={index * 0.4} />
        ))}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          maxPolarAngle={Math.PI / 1.6}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
        drag to rotate · skills orbit
      </div>
    </div>
  );
}