import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import InteractiveGrid from "./components/InteractiveGrid";
import ShaderBackground from "./components/ShaderBackground";
import FogAtmosphere from "./components/FogAtmosphere";
import AccentCursor from "./components/AccentCursor";
import Navbar from "./components/Navbar";
import HeroBold from "./components/HeroBold";
import ProjectsBold from "./components/ProjectsBold";
import Shell from "./components/Shell";
import ScrollProgress from "./components/ScrollProgress";
import { useLenis } from "./context/motion";

// Lazy load below-the-fold components
const AboutBold = lazy(() => import("./components/AboutBold"));
const SkillsMarquee = lazy(() => import("./components/SkillsMarquee"));
const ScrollCinema = lazy(() => import("./components/ScrollCinema"));
const CodingStatsBold = lazy(() => import("./components/CodingStatsBold"));
const JourneyTimeline = lazy(() => import("./components/JourneyTimeline"));
const AchievementsSection = lazy(() => import("./components/AchievementsSection"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const BeyondCodeBento = lazy(() => import("./components/BeyondCodeBento"));
const ContactBold = lazy(() => import("./components/ContactBold"));
const PortfolioBot = lazy(() => import("./components/PortfolioBot"));
const CaseStudyPage = lazy(() => import("./components/CaseStudyPage"));

/**
 * Hash route: "#/work/deskguard" → { name: "work", id: "deskguard" }.
 * Hash-based so it works on any static host with zero rewrite config, and so
 * plain anchor links (#projects etc.) keep behaving as before.
 */
function parseHash() {
  const m = window.location.hash.match(/^#\/work\/([\w-]+)/);
  return m ? { name: "work", id: m[1] } : { name: "home" };
}

function useHashRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const fn = () => setRoute(parseHash());
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return route;
}

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

/**
 * The intro wipe plays once per session, and never when someone lands directly
 * on a case-study URL — making a shared link wait behind a splash screen would
 * waste the whole point of shareable links.
 */
function shouldPlayIntro() {
  if (parseHash().name !== "home") return false;
  try {
    if (sessionStorage.getItem("introSeen")) return false;
    sessionStorage.setItem("introSeen", "1");
  } catch {
    // storage unavailable (private mode) — treat as first visit
  }
  return true;
}

export default function App() {
  const [loading, setLoading] = useState(shouldPlayIntro);
  const [introDone, setIntroDone] = useState(() => !loading);
  const [cmdOpen, setCmdOpen] = useState(false);
  const route = useHashRoute();

  // Boot smooth scrolling (Lenis)
  useLenis();

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, [loading]);

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

  // ── Case study route ──────────────────────────────────────────────
  if (route.name === "work") {
    return (
      <>
        <InteractiveGrid />
        <ScrollProgress />
        <Suspense fallback={<div className="min-h-screen" />}>
          <CaseStudyPage
            id={route.id}
            onBack={() => {
              window.location.hash = "#projects";
            }}
          />
        </Suspense>
        <Shell isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
      </>
    );
  }

  // ── Home ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Shader background */}
      <ShaderBackground />

      {/* Interactive grid background */}
      <InteractiveGrid />

      {/* Drifting ground fog above the backgrounds, below the content */}
      <FogAtmosphere />

      {/* Scroll progress bar at top */}
      <ScrollProgress />

      {/* Custom accent cursor */}
      <AccentCursor />

      {/* Hero intro is gated on the loader's exit wipe finishing (onExitComplete) */}
      <AnimatePresence mode="wait" onExitComplete={() => setIntroDone(true)}>
        {loading && <Loader />}
      </AnimatePresence>
      {!loading && (
        <>
          <Navbar onCmd={() => setCmdOpen(true)} />
          <main className="relative z-10">
            <HeroBold introDone={introDone} />
            <ProjectsBold />
            <Suspense fallback={<div className="min-h-screen" />}>
              <AboutBold />
              <SkillsMarquee />
              <ScrollCinema />
              <CodingStatsBold />
              <JourneyTimeline />
              <AchievementsSection />
              <Testimonials />
              <BeyondCodeBento />
              <PortfolioBot />
              <ContactBold />
            </Suspense>
          </main>
          <Shell isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            onClick={() => setCmdOpen(true)}
            /* Desktop-only hint: a phone has no ⌘K to press, and at 390px the
               pill sits directly on top of the hero CTA. */
            className="fixed bottom-5 left-6 z-40 hidden md:flex items-center gap-2 border rounded-full px-5 py-2 text-xs font-mono transition-all duration-300"
            style={{
              borderColor: "var(--line)",
              color: "var(--muted)",
              background: "rgba(10, 10, 11, 0.8)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="text-[var(--accent)]">➜</span> shell
            <kbd
              className="border rounded px-1.5 py-0.5"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              ⌘K
            </kbd>
          </motion.button>
        </>
      )}
    </>
  );
}
