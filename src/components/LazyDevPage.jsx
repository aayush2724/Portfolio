import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Text, Float, MeshDistortMaterial, Sphere, Box, Torus } from "@react-three/drei"
import { motion, AnimatePresence } from "framer-motion"
import * as THREE from "three"

function BouncingText() {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.15
    }
  })
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <group ref={meshRef}>
        <Text
          fontSize={0.9}
          color="var(--accent)"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
          outlineWidth={0.03}
          outlineColor="var(--accent)"
        >
          404: DEPLOY
        </Text>
        <Text
          position={[0, -1.1, 0]}
          fontSize={0.9}
          color="var(--accent)"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
          outlineWidth={0.03}
          outlineColor="var(--accent)"
        >
          NOT FOUND
        </Text>
      </group>
    </Float>
  )
}

function WobblyBlob({ position, color, speed = 1.5 }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3
      meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.2
    }
  })
  return (
    <Float speed={speed} floatIntensity={1.2} rotationIntensity={0.6}>
      <Sphere ref={meshRef} args={[0.6, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          distort={0.55}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  )
}

function SpinningDonut({ position }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.8
      meshRef.current.rotation.y = state.clock.elapsedTime * 1.2
    }
  })
  return (
    <Float speed={1.8} floatIntensity={0.6}>
      <Torus ref={meshRef} args={[0.5, 0.18, 32, 100]} position={position}>
        <meshStandardMaterial
          color="var(--accent)"
          metalness={0.9}
          roughness={0.05}
          emissive="var(--accent)"
          emissiveIntensity={0.3}
        />
      </Torus>
    </Float>
  )
}

function SpinningCube({ position }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.6
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.9
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })
  return (
    <Float speed={2.5} floatIntensity={1}>
      <Box ref={meshRef} args={[0.6, 0.6, 0.6]} position={position}>
        <meshStandardMaterial
          color="var(--accent)"
          metalness={0.95}
          roughness={0.0}
          emissive="var(--accent)"
          emissiveIntensity={0.4}
          wireframe={false}
        />
      </Box>
    </Float>
  )
}

function ParticleField() {
  const points = useRef()
  const count = 200

  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
  }

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="var(--accent)" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

function SceneCamera() {
  const { camera } = useThree()
  useFrame((state) => {
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.5
    camera.position.y = Math.cos(state.clock.elapsedTime * 0.15) * 0.3
    camera.lookAt(0, 0, 0)
  })
  return null
}

const LAZY_EXCUSES = [
  "\"I'll deploy it next sprint\" — the developer, every sprint since 2023 🗓️",
  "The dev is 'just fixing one more bug' before deploying... 🐛",
  "Currently in production... of excuses 🎭",
  "Deployment scheduled for: when pigs fly 🐷✈️",
  "The CI/CD pipeline ran away from home 🏃",
  "Too busy adding dark mode to deploy it 🌙",
  "The docker container is still building... since last Tuesday 🐳",
]

export default function LazyDevPage({ isOpen, onClose, projectTitle, githubLink }) {
  const [excuseIndex, setExcuseIndex] = useState(0)
  const [displayedExcuse, setDisplayedExcuse] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    const excuse = LAZY_EXCUSES[excuseIndex]
    let i = 0
    setDisplayedExcuse("")
    setIsTyping(true)
    const typeInterval = setInterval(() => {
      if (i < excuse.length) {
        setDisplayedExcuse(excuse.slice(0, i + 1))
        i++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, 35)
    return () => clearInterval(typeInterval)
  }, [excuseIndex, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const cycleInterval = setInterval(() => {
      setExcuseIndex((prev) => (prev + 1) % LAZY_EXCUSES.length)
    }, 5000)
    return () => clearInterval(cycleInterval)
  }, [isOpen])

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "var(--bg)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)",
            }}
          />

          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
              <SceneCamera />
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={2} color="var(--accent)" />
              <pointLight position={[-5, -3, 3]} intensity={1.5} color="var(--accent)" />
              <pointLight position={[0, -5, 2]} intensity={1} color="var(--accent)" />

              <ParticleField />
              <BouncingText />

              <WobblyBlob position={[-4, 2, -1]} color="var(--surface)" speed={1.2} />
              <WobblyBlob position={[4.5, -1.5, -2]} color="var(--surface)" speed={1.8} />
              <WobblyBlob position={[-3.5, -2, -1]} color="var(--surface)" speed={2.1} />
              <SpinningDonut position={[3.5, 2.5, 0]} />
              <SpinningDonut position={[-4, 0.5, -1]} />
              <SpinningCube position={[4, -2.5, 0]} />
              <SpinningCube position={[-5, 1.5, -2]} />

              <Float speed={1} floatIntensity={2}>
                <Sphere args={[0.35, 32, 32]} position={[0, -2.8, 1]}>
                  <meshStandardMaterial
                    color="var(--accent)"
                    emissive="var(--accent)"
                    emissiveIntensity={0.4}
                    metalness={0.2}
                    roughness={0.6}
                  />
                </Sphere>
              </Float>
            </Canvas>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl w-full pointer-events-none">
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest"
              style={{
                borderColor: "var(--accent)",
                color: "var(--accent)",
                background: "rgba(212, 255, 63, 0.08)",
              }}
            >
              🚧 &nbsp;Deployment Status: Pending Since Forever
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent) 50%, var(--accent) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
              }}
            >
              Oops.
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl font-bold text-[var(--fg)] mb-3"
            >
              The developer was <span style={{ color: "var(--accent)" }}>too lazy</span> to deploy{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, var(--accent), var(--accent))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {projectTitle}
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="h-16 flex items-center justify-center mb-8"
            >
              <p className="text-sm md:text-base text-[var(--muted)] italic font-mono max-w-lg">
                {displayedExcuse}
                {isTyping && (
                  <span
                    className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </p>
            </motion.div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", bounce: 0.4 }}
              className="text-6xl mb-8 select-none"
            >
              😴💤
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 items-center pointer-events-auto"
            >
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300"
                style={{
                  background: "var(--accent)",
                  border: "1px solid var(--accent)",
                  color: "var(--accent-ink)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent)"
                  e.currentTarget.style.borderColor = "var(--accent)"
                  e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"
                  e.currentTarget.style.boxShadow = "0 20px 60px rgba(212, 255, 63, 0.2)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent)"
                  e.currentTarget.style.borderColor = "var(--accent)"
                  e.currentTarget.style.transform = "translateY(0) scale(1)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Explore the GitHub Repo
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>

              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 pointer-events-auto"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  color: "var(--fg)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface)"
                  e.currentTarget.style.borderColor = "var(--accent)"
                  e.currentTarget.style.color = "var(--accent)"
                  e.currentTarget.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface)"
                  e.currentTarget.style.borderColor = "var(--line)"
                  e.currentTarget.style.color = "var(--fg)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Go Back
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-10 text-xs text-[var(--muted)] font-mono"
            >
              (The code exists. It's beautiful. It just... lives locally. 🏠)
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onClose}
            className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              color: "var(--muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface)"
              e.currentTarget.style.borderColor = "var(--accent)"
              e.currentTarget.style.color = "var(--accent)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface)"
              e.currentTarget.style.borderColor = "var(--line)"
              e.currentTarget.style.color = "var(--muted)"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
