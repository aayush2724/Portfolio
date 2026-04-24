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
        className={`mx-auto max-w-6xl px-6 flex items-center justify-between rounded-2xl py-3 ${scrolled ? "gc" : "bg-black/65 backdrop-blur-xl border border-white/5"}`}
      >
        <a
          href="#hero"
          className="font-display font-bold text-lg text-white px-2"
        >
          Aayush
        </a>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-xs text-white/45 hover:text-white transition-colors font-body tracking-wide"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCmd}
            className="w-9 h-9 rounded-xl gc border border-white/10 text-white/45 hover:text-amber-400 transition-colors text-sm"
            aria-label="Open command palette"
          >
            ◔
          </button>
          <a
            href="#projects"
            className="px-5 py-2 rounded-xl bg-amber-500 text-black text-xs font-display font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
          >
            See My Work
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-amber-500/35 text-amber-300 text-xs font-display font-bold hover:border-amber-400 hover:text-amber-200 transition-colors hover:bg-amber-500/5"
          >
            Resume
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
