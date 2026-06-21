import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"
import { TypingTerminal } from "./Terminal"
import portfolioData from "../data/portfolioData.json"

export default function HeroBold() {
  const { scrollY } = useScroll()
  const hintOpacity = useTransform(scrollY, [0, 100], [1, 0])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const leetcodeSolved = (portfolioData.leetcode?.stats?.totalSolved || 400) + "+"
  const projectsShipped = (portfolioData.github?.length || 12) + "+"
  const currentStreak = (portfolioData.leetcode?.streak || 25) + "-day"

  return (
    <section id="hero" className="relative flex min-h-screen items-center px-6 md:px-16 py-20">
      <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left: Text Content */}
        <div className="flex flex-col justify-center">
          {/* Eyebrow */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 text-xs md:text-sm tracking-[0.35em] text-[var(--accent)]"
          >
            CS STUDENT · FULL-STACK DEVELOPER · GUITARIST
          </motion.p>

          {/* Name with clip-path reveals */}
          <h1 className="font-display uppercase leading-[0.82] text-[16vw] md:text-[8vw] lg:text-[7vw] overflow-hidden">
            <motion.span
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0 0 0)" }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              Aayush
            </motion.span>
            <motion.span
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0 0 0)" }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="block text-[var(--accent)]"
            >
              Kumar
            </motion.span>
          </h1>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap gap-x-10 gap-y-2 text-sm md:text-base text-[var(--muted)]"
          >
            <span><b className="text-[var(--fg)]">{leetcodeSolved}</b> LeetCode solved</span>
            <span><b className="text-[var(--fg)]">{projectsShipped}</b> projects shipped</span>
            <span><b className="text-[var(--fg)]">{currentStreak}</b> streak</span>
          </motion.div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-lg"
          >
            <TypingTerminal
              className="h-[380px] sm:h-[320px]"
              title="aayush@portfolio — zsh"
              path="~"
              steps={[
                { cmd: "whoami", out: "Aayush Kumar — CS student & full-stack dev" },
                { cmd: "cat skills.txt", out: "React · Node · Python · C++ · DSA" },
                { cmd: "ls projects/", out: "portfolio  chess-app  leetcode-tracker  discord-bot" },
                { cmd: "cat contact.txt", out: "aayush2615@gmail.com" },
                { cmd: "echo $STATUS", out: "open to work & collaboration" },
                { cmd: "./launch --status", out: "🚀 available for opportunities" },
              ]}
            />
          </motion.div>

          {/* CTA */}
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
            href="#projects"
            className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent-ink)] transition-all duration-300 hover:gap-5"
          >
            View work →
          </motion.a>
        </div>

        {/* Right: Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex justify-center md:justify-end"
        >
          {/* Accent glow background - animated */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: imageLoaded ? [0.1, 0.2, 0.1] : 0,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute inset-0 blur-[100px]"
            style={{ 
              background: `radial-gradient(circle at center, var(--accent), transparent 60%)`,
            }}
          />

          {/* Portrait container */}
          <motion.div 
            className="relative w-full max-w-md"
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Animated border */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="absolute -inset-[3px] rounded-3xl"
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `conic-gradient(from 0deg, var(--accent), transparent 60%, transparent 80%, var(--accent))`,
                }}
              />
            </motion.div>

            {/* Image container with tilt on hover */}
            <motion.div 
              className="relative rounded-3xl overflow-hidden"
              style={{ background: "var(--surface)" }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              whileHover={{ 
                scale: 1.02,
                rotateY: 5,
                rotateX: -5,
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                src="/portrait.jpeg"
                alt="Portrait of Aayush Kumar - Full-stack developer and CS student"
                loading="eager"
                className="w-full h-auto object-cover"
                style={{ 
                  aspectRatio: "3/4",
                }}
                initial={{ scale: 1.15, filter: "grayscale(1) brightness(0.7)" }}
                animate={{ 
                  scale: isHovered ? 1.05 : 1,
                  filter: isHovered 
                    ? "grayscale(0) brightness(1)" 
                    : imageLoaded ? "grayscale(1) brightness(0.9)" : "grayscale(1) brightness(0.7)",
                }}
                transition={{ 
                  scale: { duration: 0.3 },
                  filter: { duration: 0.4 }
                }}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.style.background = `linear-gradient(135deg, var(--surface), var(--bg))`
                }}
              />
              
              {/* Overlay gradient */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, var(--bg) 0%, transparent 40%)`,
                  opacity: 0.6,
                }}
              />

              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(110deg, transparent 40%, rgba(212, 255, 63, 0.1) 50%, transparent 60%)`,
                  backgroundSize: "200% 100%",
                }}
                initial={{ backgroundPosition: "-200% 0" }}
                whileHover={{ backgroundPosition: "200% 0" }}
                transition={{ duration: 0.8 }}
              />
            </motion.div>

            {/* Floating badge with pulse */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1,
              }}
              transition={{ duration: 0.6, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="absolute -bottom-4 -left-4 px-5 py-3 rounded-2xl border backdrop-blur-xl cursor-pointer"
              style={{
                background: "rgba(10, 10, 11, 0.9)",
                borderColor: "var(--line)",
              }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.6, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
                <motion.p 
                  className="text-xs font-mono tracking-wider"
                  style={{ color: "var(--accent)" }}
                >
                  Available for opportunities
                </motion.p>
              </div>
            </motion.div>

            {/* Floating particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ 
                  background: "var(--accent)",
                  opacity: 0.4,
                  left: `${20 + i * 30}%`,
                  top: `${30 + i * 20}%`,
                }}
                animate={{
                  y: [-20, -40, -20],
                  x: [0, 10, 0],
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity: hintOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--accent)] pointer-events-none"
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs tracking-widest uppercase"
        >
          Scroll
        </motion.span>
        <motion.svg
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </motion.svg>
      </motion.div>
    </section>
  )
}
