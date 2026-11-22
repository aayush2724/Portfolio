import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MenuOverlay from "./MenuOverlay";

/**
 * The full-screen menu is the table of contents: every scene, numbered the
 * way its header rail and the HUD number it, so 01–13 run without gaps and
 * the sections the top bar has no room for are one click away.
 */
const menuLinks = [
  { label: "Index", href: "#hero" },
  { label: "HQ", href: "#hq" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Approach", href: "#approach" },
  { label: "Stats", href: "#stats" },
  { label: "Journey", href: "#journey" },
  { label: "Now", href: "#now" },
  { label: "Play", href: "#play" },
  { label: "Beyond code", href: "#life" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

const primaryLinks = menuLinks.filter(link => ["#projects", "#about", "#stats", "#journey", "#contact"].includes(link.href));

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);

  // Direction-aware hide/show.
  // Coalesced into one rAF so a fast flick can't queue a state update per
  // scroll event and re-render the nav dozens of times a frame.
  useEffect(() => {
    let ticking = false;
    const fn = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
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
    const sections = menuLinks.map(l => document.querySelector(l.href)).filter(Boolean);
    
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
        aria-label="Primary"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden && !mobileOpen ? "-110%" : 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6"
      >
        <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between px-3 py-2 sm:px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] 2xl:max-w-[88vw]">
          {/* Logo — Clash Display wordmark matching the section headings;
              the accent period carries the signature instead of a script font. */}
          <a
            href="#hero"
            aria-label="Aayush Kumar — back to top"
            className="pointer-events-auto justify-self-start font-display font-bold text-2xl leading-none tracking-tight transition-colors duration-300 hover:text-[var(--accent)]"
            style={{ color: "var(--fg)" }}
          >
            Aayush<span style={{ color: "var(--accent)" }}>.</span>
          </a>

          <div className="primary-nav-links pointer-events-auto hidden items-center gap-3 lg:flex xl:gap-4">
            {primaryLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                aria-current={activeSection === href ? "location" : undefined}
                className="primary-nav-link"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="pointer-events-auto flex items-center gap-3 justify-self-end">
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--fg)] transition-colors hover:text-[var(--accent)]">
              Resume
            </a>
            {/* Menu Toggle — the full-screen overlay is the menu on every
                breakpoint, so the hamburger stays visible on desktop too */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="site-menu"
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
        links={menuLinks}
        activeSection={activeSection}
      />
    </>
  );
}
