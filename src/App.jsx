import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import InteractiveGrid from "./components/InteractiveGrid";
import ShaderBackground from "./components/ShaderBackground";
import AccentCursor from "./components/AccentCursor";
import Navbar from "./components/Navbar";
import HeroBold from "./components/HeroBold";
import ProjectsBold from "./components/ProjectsBold";
import CommandPalette from "./components/CommandPalette";
import ScrollProgress from "./components/ScrollProgress";
import { useLenis } from "./context/motion";

// Lazy load below-the-fold components
const AboutBold = lazy(() => import("./components/AboutBold"));
const SkillsMarquee = lazy(() => import("./components/SkillsMarquee"));
const CodingStatsBold = lazy(() => import("./components/CodingStatsBold"));
const JourneyTimeline = lazy(() => import("./components/JourneyTimeline"));
const BeyondCodeBento = lazy(() => import("./components/BeyondCodeBento"));
const ContactBold = lazy(() => import("./components/ContactBold"));
const PortfolioBot = lazy(() => import("./components/PortfolioBot"));

function Loader() {
  return (
    <motion.div
      key="loader"
      initial={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "var(--accent)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="font-display font-extrabold text-6xl md:text-7xl"
        style={{ color: "var(--accent-ink)" }}
      >
        Aayush
      </motion.div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        exit={{ scaleX: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 h-1 w-32 origin-center"
        style={{ background: "var(--accent-ink)" }}
      />
    </motion.div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Boot smooth scrolling (Lenis)
  useLenis();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <>
      {/* Shader background */}
      <ShaderBackground />

      {/* Interactive grid background */}
      <InteractiveGrid />

      {/* Scroll progress bar at top */}
      <ScrollProgress />

      {/* Custom accent cursor */}
      <AccentCursor />

      <AnimatePresence mode="wait">{loading && <Loader />}</AnimatePresence>
      {!loading && (
        <>
          <Navbar onCmd={() => setCmdOpen(true)} />
          <main className="relative z-10">
            <HeroBold />
            <ProjectsBold />
            <Suspense fallback={<div className="min-h-screen" />}>
              <AboutBold />
              <SkillsMarquee />
              <CodingStatsBold />
              <JourneyTimeline />
              <BeyondCodeBento />
              <PortfolioBot />
              <ContactBold />
            </Suspense>
          </main>
          <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
            onClick={() => setCmdOpen(true)}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 border rounded-full px-5 py-2 text-xs font-mono transition-all duration-300"
            style={{
              borderColor: "var(--line)",
              color: "var(--muted)",
              background: "rgba(10, 10, 11, 0.8)",
              backdropFilter: "blur(8px)"
            }}
          >
            Press{" "}
            <kbd className="border rounded px-1.5 py-0.5" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
              ⌘K
            </kbd>{" "}
            to navigate
          </motion.button>
        </>
      )}
    </>
  );
}
