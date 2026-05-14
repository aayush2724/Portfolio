import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

export default function ProjectCard3D({ p, i, children }) {
  const ref = useRef(null);
  const [hov, setHov] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 18 });
  const sy = useSpring(y, { stiffness: 150, damping: 18 });

  const rx = useTransform(sy, [-0.5, 0.5], [12, -12]);
  const ry = useTransform(sx, [-0.5, 0.5], [-12, 12]);

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
    setHov(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={onLeave}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
      data-testid={`project-card-3d-${p.repo}`}
      className="relative will-change-transform"
    >
      <motion.div
        className="pointer-events-none absolute -inset-2 rounded-2xl blur-2xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${p.color}30, transparent 65%)`,
          opacity: hov ? 1 : 0.35,
          transform: "translateZ(-30px)",
        }}
      />

      <div
        className="gc group relative overflow-hidden rounded-2xl border border-white/8 p-6"
        style={{
          boxShadow: hov
            ? `0 30px 60px -10px ${p.color}30, 0 0 0 1px ${p.color}25 inset`
            : "0 10px 30px -10px rgba(0,0,0,0.6)",
          transform: "translateZ(0)",
        }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `linear-gradient(135deg, transparent 30%, ${p.color}10 50%, transparent 70%)`,
            mixBlendMode: "screen",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            transform: "translateZ(8px)",
          }}
        />

        <motion.div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl"
          style={{
            background: p.color,
            opacity: hov ? 0.18 : 0.06,
            transform: "translateZ(20px)",
          }}
        />

        <div
          className="relative z-10"
          style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
        >
          {children}
        </div>

        <div
          className="absolute right-3 top-3 font-mono text-[9px] uppercase tracking-[0.3em] text-white/25"
          style={{ transform: "translateZ(30px)" }}
        >
          /{String(i + 1).padStart(2, "0")}
        </div>
      </div>
    </motion.div>
  );
}
