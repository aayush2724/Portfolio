import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import portfolioData from "../data/portfolioData.json";

const roles = [
  "Full-Stack Developer",
  "DSA Problem Solver",
  "CS Undergrad",
  "Guitarist 🎸",
];

// ── Particle canvas ────────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current,
      ctx = c.getContext("2d");
    let raf,
      mouse = { x: -999, y: -999 };
    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.3,
      col: ["#f59e0b", "#06b6d4", "#a855f7", "#22c55e"][
        Math.floor(Math.random() * 4)
      ],
      o: Math.random() * 0.35 + 0.08,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach((p, i) => {
        const dx = p.x - mouse.x,
          dy = p.y - mouse.y,
          d = Math.hypot(dx, dy);
        if (d < 120) {
          p.vx += (dx / d) * 0.45;
          p.vy += (dy / d) * 0.45;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        if (p.x < 0) p.x = c.width;
        if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height;
        if (p.y > c.height) p.y = 0;
        pts.slice(i + 1).forEach((q) => {
          const dx2 = p.x - q.x,
            dy2 = p.y - q.y,
            d2 = Math.hypot(dx2, dy2);
          if (d2 < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(245,158,11,${0.08 * (1 - d2 / 100)})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col;
        ctx.globalAlpha = p.o;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0" />;
}

// ── Magnetic button ────────────────────────────────────────────────────────────
function MagneticButton({ children, className, href, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15 });
  const sy = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      {...props}
    >
      {children}
    </motion.a>
  );
}

// ── Role cycler ────────────────────────────────────────────────────────────────
function RoleCycler() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % roles.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="h-7 overflow-hidden min-w-[200px] sm:min-w-[260px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ y: 28, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -28, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-sm tracking-widest uppercase text-amber-400"
        >
          {roles[i]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Scroll indicator ───────────────────────────────────────────────────────────
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="font-mono text-[10px] text-white/15 tracking-[0.25em] uppercase">
        scroll
      </span>
      <div className="w-px h-12 bg-gradient-to-b from-amber-500/50 to-transparent relative overflow-hidden">
        <motion.div
          className="absolute w-full bg-amber-400"
          style={{ height: "40%" }}
          animate={{ y: ["0%", "200%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

// ── Stats strip ────────────────────────────────────────────────────────────────
const stats = [
  { value: `${portfolioData.leetcode.stats.totalSolved}+`, label: "LeetCode solved" },
  { value: `${portfolioData.github.length}+`, label: "Projects shipped" },
];

// ── Hero ───────────────────────────────────────────────────────────────────────
export default function Hero() {
  const mx = useMotionValue(0),
    my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 35, damping: 20 });
  const sy = useSpring(my, { stiffness: 35, damping: 20 });
  const rx = useTransform(sy, [-300, 300], [5, -5]);
  const ry = useTransform(sx, [-300, 300], [-5, 5]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-x-clip"
    >
      <ParticleCanvas />

      {/* layered glows */}
      <div className="fixed top-1/4 left-1/5 w-[600px] h-[600px] bg-amber-500/[0.05] rounded-full blur-[120px] pointer-events-none animate-pulse z-0" />
      <div className="fixed bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/[0.04] rounded-full blur-[100px] pointer-events-none animate-pulse z-0" style={{ animationDelay: '1s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/[0.03] rounded-full blur-[140px] pointer-events-none animate-pulse z-0" style={{ animationDelay: '2s' }} />

      {/* Main content */}
      <motion.div
        onMouseMove={onMove}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 gc rounded-full px-4 py-2 mb-10 border border-white/10"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="font-mono text-xs text-white/50 tracking-wider">
            Open to internships &amp; collabs
          </span>
        </motion.div>

        {/* Name */}
        <div className="mb-4 overflow-visible">
          <motion.h1
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-extrabold leading-none tracking-tight metal-title"
            style={{ fontSize: "clamp(2.5rem, 9.5vw, 9rem)", letterSpacing: "-0.02em", padding: "0 0.15em" }}
          >
            AAYUSH
          </motion.h1>
        </div>

        {/* Role cycler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className="w-10 h-px bg-gradient-to-r from-transparent to-amber-500/50" />
          <RoleCycler />
          <span className="w-10 h-px bg-gradient-to-l from-transparent to-amber-500/50" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 1 }}
          className="text-white/35 font-body text-base md:text-lg max-w-lg mx-auto mb-12 leading-relaxed"
        >
          I build things that matter — secure systems, relief platforms, and
          learning tools — then unwind with{" "}
          <span className="text-amber-400/70 italic">Stairway to Heaven</span> on guitar.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0"
        >
          <MagneticButton
            href="#projects"
            className="relative w-full sm:w-auto flex justify-center group px-8 sm:px-9 py-4 bg-amber-500 text-black font-display font-semibold rounded-2xl text-sm tracking-wide overflow-hidden hover:shadow-2xl hover:shadow-amber-500/30 transition-shadow duration-300"
          >
            <span className="relative z-10">See My Work</span>
            <div className="absolute inset-0 bg-amber-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </MagneticButton>

          <MagneticButton
            href="https://github.com/aayush2724"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto justify-center px-8 sm:px-9 py-4 gc border border-white/10 rounded-2xl text-sm font-display font-medium hover:border-amber-500/40 hover:text-amber-400 transition-colors duration-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            aayush2724
          </MagneticButton>

          <MagneticButton
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex justify-center px-8 sm:px-9 py-4 gc border border-amber-500/30 rounded-2xl text-sm font-display font-medium text-amber-300 hover:border-amber-500/60 hover:text-amber-200 transition-colors duration-300"
          >
            Resume
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="relative z-10 mt-20 w-full max-w-3xl mx-auto px-4 sm:px-6"
      >
        <div className="gc border border-white/8 rounded-2xl px-4 py-5 md:px-8 flex flex-wrap md:flex-nowrap items-center justify-around">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 min-w-[45%] md:min-w-0 text-center py-2 md:py-0 ${
                i > 0 ? "md:border-l md:border-white/10" : ""
              } ${i % 2 === 1 ? "border-l border-white/10 md:border-l md:border-white/10" : ""}`}
            >
              <div className="font-display font-extrabold text-xl md:text-2xl text-amber-400">
                {s.value}
              </div>
              <div className="font-mono text-[10px] text-white/25 tracking-wider mt-1 uppercase">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Code snippet decoration */}
      <div className="absolute top-24 right-8 font-mono text-xs text-white/8 text-right hidden xl:block leading-6 select-none">
        <div className="text-amber-500/25">// aayush.config.ts</div>
        <div>export default {"{"}</div>
        <div className="text-cyan-400/20">
          {"  "}stack: ["React","Node","C++","Python"],
        </div>
        <div className="text-purple-400/20">
          {"  "}guitar: "Stairway to Heaven 🎸",
        </div>
        <div className="text-green-400/20">{"  "}leetcode: "aayush2717",</div>
        <div className="text-amber-400/20">
          {"  "}status: "always building…"
        </div>
        <div>{"}"}</div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
