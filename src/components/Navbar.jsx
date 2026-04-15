import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Life", href: "#life" },
  { label: "Timeline", href: "#timeline" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ onCmd }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
    >
      <div
        className={`mx-auto max-w-6xl px-6 flex items-center justify-between ${scrolled ? "gc rounded-2xl py-3 px-6" : ""}`}
      >
        <a href="#hero" className="font-display font-bold text-lg">
          <span className="ga">A</span>
          <span className="text-white/70">ayush</span>
        </a>
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-white/40 hover:text-amber-400 transition-colors font-body tracking-wide"
            >
              {l.label}
            </a>
          ))}
        </div>
        <button
          onClick={onCmd}
          className="gc border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white/30 hover:text-amber-400 hover:border-amber-400/30 transition-all"
        >
          ⌘K
        </button>
      </div>
    </motion.nav>
  );
}
