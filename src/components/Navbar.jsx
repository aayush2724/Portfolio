import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import MagneticButton from "./MagneticButton";
import MenuOverlay from "./MenuOverlay";
import { useLowPower } from "../context/motion";

const links = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Stats", href: "#stats" },
  { label: "Journey", href: "#journey" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

function MagneticNavLink({ children, href, active, onClick }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.2); 
    y.set((clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="relative text-sm transition-colors hover:text-[var(--fg)] px-2 py-1"
      animate={{
        color: active ? "var(--fg)" : "var(--muted)",
      }}
    >
      {children}
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full"
          style={{ background: "var(--accent)" }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </motion.a>
  );
}

export default function Navbar({ onCmd }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);
  const lowPower = useLowPower();

  // Scroll detection: blur background + direction-aware hide/show.
  // Coalesced into one rAF so a fast flick can't queue a state update per
  // scroll event and re-render the nav dozens of times a frame.
  useEffect(() => {
    let ticking = false;
    const fn = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 80);
        // Hide when scrolling down past the hero fold, reveal on any scroll up
        setHidden(y > lastY.current && y > 160);
        lastY.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Scroll spy for active section
  useEffect(() => {
    const sections = links.map(l => document.querySelector(l.href)).filter(Boolean);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
    );

    sections.forEach(section => observer.observe(section));
    return () => sections.forEach(section => observer.unobserve(section));
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden && !mobileOpen ? "-110%" : 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-colors duration-300"
        style={{
          // backdrop-filter on a fixed full-width bar makes the phone re-blur
          // the page behind it on every scroll frame; use an opaque fill there.
          background: scrolled
            ? lowPower
              ? "#0a0a0b"
              : "rgba(10, 10, 11, 0.7)"
            : "transparent",
          backdropFilter: scrolled && !lowPower ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Logo — Clash Display wordmark matching the section headings;
              the accent period carries the signature instead of a script font. */}
          <a
            href="#hero"
            className="font-display font-bold text-2xl leading-none tracking-tight transition-colors duration-300 hover:text-[var(--accent)]"
            style={{ color: "var(--fg)" }}
          >
            Aayush<span style={{ color: "var(--accent)" }}>.</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <MagneticNavLink
                key={l.label}
                href={l.href}
                active={activeSection === l.href}
              >
                {l.label}
              </MagneticNavLink>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Command Palette Button */}
            <button
              onClick={onCmd}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg border transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{
                borderColor: "var(--line)",
                color: "var(--muted)",
              }}
              aria-label="Open command palette"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
              </svg>
            </button>

            {/* Resume Button */}
            <MagneticButton
              as={motion.a}
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              strength={0.35}
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:gap-3"
              style={{
                background: "var(--accent)",
                color: "var(--accent-ink)",
              }}
            >
              Resume
            </MagneticButton>

            {/* Menu Toggle — the full-screen overlay is the menu on every
                breakpoint, so the hamburger stays visible on desktop too */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 w-9 h-9 items-center justify-center"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="w-5 h-0.5 rounded-full"
                style={{ background: "var(--fg)" }}
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-5 h-0.5 rounded-full"
                style={{ background: "var(--fg)" }}
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="w-5 h-0.5 rounded-full"
                style={{ background: "var(--fg)" }}
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Full-screen menu (all breakpoints) */}
      <MenuOverlay
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={links}
        activeSection={activeSection}
      />
    </>
  );
}
