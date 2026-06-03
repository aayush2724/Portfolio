import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Stats", href: "#stats" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ onCmd }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll detection for blur background
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn);
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

  const handleLinkClick = (href) => {
    setMobileOpen(false);
    // Let default anchor behavior work
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(10, 10, 11, 0.7)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            className="font-display font-bold text-xl transition-colors"
            style={{ color: "var(--fg)" }}
          >
            Aayush
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="relative text-sm transition-colors hover:text-[var(--fg)]"
                style={{
                  color: activeSection === l.href ? "var(--fg)" : "var(--muted)",
                }}
              >
                {l.label}
                {activeSection === l.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full"
                    style={{ background: "var(--accent)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
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
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:gap-3"
              style={{
                background: "var(--accent)",
                color: "var(--accent-ink)",
              }}
            >
              Resume
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1.5 w-9 h-9 items-center justify-center"
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] md:hidden flex flex-col items-center justify-center"
            style={{ background: "var(--bg)" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 flex flex-col gap-1.5 w-9 h-9 items-center justify-center"
              aria-label="Close menu"
            >
              <motion.span
                initial={{ rotate: 0 }}
                animate={{ rotate: 45, y: 6 }}
                className="w-5 h-0.5 rounded-full"
                style={{ background: "var(--fg)" }}
              />
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                className="w-5 h-0.5 rounded-full"
                style={{ background: "var(--fg)" }}
              />
              <motion.span
                initial={{ rotate: 0 }}
                animate={{ rotate: -45, y: -6 }}
                className="w-5 h-0.5 rounded-full"
                style={{ background: "var(--fg)" }}
              />
            </button>

            {/* Menu Items */}
            <nav className="flex flex-col items-center gap-8">
              {links.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={() => handleLinkClick(l.href)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="font-display text-4xl uppercase transition-colors"
                  style={{
                    color: activeSection === l.href ? "var(--accent)" : "var(--fg)",
                  }}
                >
                  {l.label}
                </motion.a>
              ))}
              
              {/* Mobile Resume Link */}
              <motion.a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + links.length * 0.05 }}
                className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-ink)",
                }}
              >
                Resume →
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
