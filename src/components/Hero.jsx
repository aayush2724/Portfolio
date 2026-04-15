import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const roles = [
  "Full-Stack Developer",
  "DSA Problem Solver",
  "Guitarist",
  "CS Undergrad",
];

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
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.4,
      col: ["#f59e0b", "#06b6d4", "#a855f7"][Math.floor(Math.random() * 3)],
      o: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach((p, i) => {
        const dx = p.x - mouse.x,
          dy = p.y - mouse.y,
          d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          p.vx += (dx / d) * 0.4;
          p.vy += (dy / d) * 0.4;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        if (p.x < 0) p.x = c.width;
        if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height;
        if (p.y > c.height) p.y = 0;
        pts.slice(i + 1).forEach((q) => {
          const dx = p.x - q.x,
            dy = p.y - q.y,
            d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(245,158,11,${0.07 * (1 - d / 90)})`;
            ctx.lineWidth = 0.5;
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
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" />;
}

function RoleCycler() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % roles.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="h-7 overflow-hidden">
      <motion.div
        key={i}
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -28, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="font-mono text-sm tracking-widest uppercase text-amber-400"
      >
        {roles[i]}
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const mx = useMotionValue(0),
    my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 }),
    sy = useSpring(my, { stiffness: 40, damping: 18 });
  const rx = useTransform(sy, [-300, 300], [7, -7]),
    ry = useTransform(sx, [-300, 300], [-7, 7]);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg"
    >
      <ParticleCanvas />
      {/* glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-500/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        onMouseMove={onMove}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 gc rounded-full px-4 py-2 mb-10 border border-amber-500/20"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs text-white/50 tracking-wider">
            Open to internships & collabs
          </span>
        </motion.div>

        {/* name */}
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-extrabold text-7xl md:text-[9rem] leading-none tracking-tighter text-white/90 mb-4"
        >
          Aayush
        </motion.h1>

        {/* role cycler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className="w-8 h-px bg-amber-500/40" />
          <RoleCycler />
          <span className="w-8 h-px bg-amber-500/40" />
        </motion.div>

        {/* tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-white/35 font-body text-base md:text-lg max-w-lg mx-auto mb-12 leading-relaxed"
        >
          I build things that matter — secure systems, relief platforms, and
          learning tools — then unwind with{" "}
          <span className="text-amber-400/70">Stairway to Heaven</span> on
          guitar.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <a
            href="#projects"
            className="group relative px-8 py-4 bg-amber-500 text-black font-display font-semibold rounded-xl text-sm tracking-wide overflow-hidden hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-amber-500/25"
          >
            See My Work
          </a>
          <a
            href="https://github.com/aayush2724"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 gc border border-white/10 rounded-xl text-sm font-display font-medium hover:border-amber-500/40 hover:text-amber-400 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            aayush2724
          </a>
        </motion.div>
      </motion.div>

      {/* code snippet decoration */}
      <div className="absolute top-24 right-8 font-mono text-xs text-white/8 text-right hidden xl:block leading-6">
        <div className="text-amber-500/20">// aayush.config.js</div>
        <div>export default {"{"}</div>
        <div className="text-cyan-400/20"> stack: ["React","Node","C++"],</div>
        <div className="text-purple-400/20">
          {" "}
          guitar: "Stairway to Heaven 🎸",
        </div>
        <div className="text-green-400/20"> leetcode: "aayush2717",</div>
        <div className="text-amber-400/20"> status: "building..."</div>
        <div>{"}"}</div>
      </div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-xs text-white/15 tracking-widest">
          scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-amber-500/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}
