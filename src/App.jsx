import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import InteractiveGrid from "./components/InteractiveGrid";
import CinemaBackground from "./components/CinemaBackground";
import FogAtmosphere from "./components/FogAtmosphere";
import AccentCursor from "./components/AccentCursor";
import Navbar from "./components/Navbar";
import HeroBold from "./components/HeroBold";
import CabinMap from "./components/CabinMap";
import ProjectsBold from "./components/ProjectsBold";
import Shell from "./components/Shell";
import Dock from "./components/Dock";
import ScrollProgress from "./components/ScrollProgress";
import { useLenis } from "./context/motion";
import { EASE, DUR } from "./context/ease";
import { opening, canShoot, setOpening, onOpening } from "./context/opening";

// Lazy load below-the-fold components
const AboutBold = lazy(() => import("./components/AboutBold"));
const SkillsMarquee = lazy(() => import("./components/SkillsMarquee"));
const ScrollCinema = lazy(() => import("./components/ScrollCinema"));
const CodingStatsBold = lazy(() => import("./components/CodingStatsBold"));
const JourneyTimeline = lazy(() => import("./components/JourneyTimeline"));
const AchievementsSection = lazy(() => import("./components/AchievementsSection"));
const Fretboard = lazy(() => import("./components/Fretboard"));
const BeyondCodeBento = lazy(() => import("./components/BeyondCodeBento"));
const ContactBold = lazy(() => import("./components/ContactBold"));
const Footer = lazy(() => import("./components/Footer"));
const PortfolioBot = lazy(() => import("./components/PortfolioBot"));
const CaseStudyPage = lazy(() => import("./components/CaseStudyPage"));
const BlogPage = lazy(() => import("./components/BlogPage"));
const NowSection = lazy(() => import("./components/NowSection"));

/**
 * Hash route: "#/work/deskguard" → { name: "work", id: "deskguard" }.
 * Hash-based so it works on any static host with zero rewrite config, and so
 * plain anchor links (#projects etc.) keep behaving as before.
 */
function parseHash() {
  const h = window.location.hash;
  let m = h.match(/^#\/work\/([\w-]+)/);
  if (m) return { name: "work", id: m[1] };
  // "#/blog" is the index, "#/blog/<slug>" a post.
  m = h.match(/^#\/blog(?:\/([\w-]+))?\/?$/);
  if (m) return { name: "blog", id: m[1] || null };
  return { name: "home" };
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

/**
 * The intro slate: the wordmark and a rule that draws under it, on the page
 * colour. With the opening shot it holds until the room is ready and then
 * fades straight into it; without one it lifts away after a beat.
 */
function Slate({ shot }) {
  const word = "Aayush"
  return (
    <motion.div
      key="loader"
      role="status"
      aria-label="Loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shot ? 0.9 : 0.6, ease: EASE.SHARP }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      <motion.div exit={{ y: -14, opacity: 0 }} transition={{ duration: DUR.exit, ease: EASE.EXIT }} className="flex flex-col items-center">
        <div className="flex overflow-hidden font-display text-6xl md:text-8xl" style={{ color: "var(--fg)" }}>
          {word.split("").map((ch, i) => (
            <motion.span
              key={i}
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: DUR.enter, ease: EASE.ENTER, delay: 0.1 + i * 0.045 }}
            >
              {ch}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.sharp, delay: 0.5 }}
            style={{ color: "var(--accent)" }}
          >
            .
          </motion.span>
        </div>
        <motion.span
          aria-hidden="true"
          className="mt-6 block h-px w-40 origin-left md:w-56"
          style={{ background: "var(--accent)" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: shot ? 2.4 : 1.1, ease: EASE.WIPE, delay: 0.3 }}
        />
        <p className="mt-5 font-mono text-[11px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
          ./open hq
        </p>
      </motion.div>
    </motion.div>
  )
}

/**
 * The intro plays once per session, and never when someone lands directly
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

/**
 * Decided once per page load and cached: shouldPlayIntro() marks the session
 * as seen, so a second call (StrictMode runs state initialisers twice) must
 * not get a different answer. On a desktop with the room behind the page,
 * the intro is the opening shot.
 */
let intro = null;
function introPlan() {
  if (!intro) {
    const play = shouldPlayIntro();
    intro = { play, shot: play && canShoot() };
    if (intro.shot) setOpening("pending");
  }
  return intro;
}

/**
 * First tab stop on the page. Lenis owns in-page anchor clicks on desktop, so
 * the handler moves focus itself instead of relying on the fragment jump.
 */
function SkipLink() {
  return (
    <a
      href="#main"
      className="skip-link"
      onClick={(e) => {
        const main = document.getElementById("main");
        if (!main) return;
        e.preventDefault();
        main.focus({ preventScroll: true });
        main.scrollIntoView();
      }}
    >
      Skip to content
    </a>
  );
}

export default function App() {
  const [loading, setLoading] = useState(() => introPlan().play);
  const [introDone, setIntroDone] = useState(() => !loading);
  const [shot] = useState(() => introPlan().shot);
  const [cmdOpen, setCmdOpen] = useState(false);
  const route = useHashRoute();

  // Boot smooth scrolling (Lenis)
  useLenis();

  useEffect(() => {
    if (!loading) return;
    // Opening shot: hold the slate until the room is built, but never long.
    if (opening.state === "pending") {
      const off = onOpening((state) => {
        if (state !== "pending") setLoading(false);
      });
      const cap = setTimeout(() => {
        if (opening.state === "pending") setOpening("cancelled");
      }, 3000);
      return () => {
        off();
        clearTimeout(cap);
      };
    }
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, [loading]);

  // The headline comes in as the dolly lands (or is skipped).
  useEffect(
    () =>
      onOpening((state) => {
        if (state === "done") setIntroDone(true);
      }),
    []
  );

  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    // The hero's "Open the shell" button asks for it by event.
    const open = () => setCmdOpen(true);
    window.addEventListener("keydown", fn);
    window.addEventListener("open-shell", open);
    return () => {
      window.removeEventListener("keydown", fn);
      window.removeEventListener("open-shell", open);
    };
  }, []);

  // ── Case study route ──────────────────────────────────────────────
  if (route.name === "work") {
    return (
      <>
        <SkipLink />
        <InteractiveGrid />
        <ScrollProgress />
        <Suspense fallback={<div className="min-h-screen" />}>
          <CaseStudyPage
            id={route.id}
            onBack={() => {
              window.location.hash = "#projects";
            }}
          />
          <PortfolioBot />
        </Suspense>
        <Shell isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
        <Dock onShell={() => setCmdOpen(true)} />
      </>
    );
  }

  // ── Blog route ───────────────────────────────────────────────────
  if (route.name === "blog") {
    return (
      <>
        <SkipLink />
        <InteractiveGrid />
        <ScrollProgress />
        <Suspense fallback={<div className="min-h-screen" />}>
          <BlogPage
            slug={route.id}
            onBack={() => {
              window.location.hash = "#now";
            }}
          />
          <PortfolioBot />
        </Suspense>
        <Shell isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
        <Dock onShell={() => setCmdOpen(true)} />
      </>
    );
  }

  // ── Home ──────────────────────────────────────────────────────────
  return (
    <>
      <SkipLink />

      {/* Flat grid + page colour, the floor everything else sits on */}
      <InteractiveGrid />

      {/* HQ: the 3D room the page walks through (desktop only, z-[1]) */}
      <CinemaBackground />

      {/* Drifting ground fog above the backgrounds, below the content */}
      <FogAtmosphere />

      {/* Scroll progress bar at top */}
      <ScrollProgress />

      {/* Custom accent cursor */}
      <AccentCursor />

      {/* Hero intro waits for the slate to lift, or for the opening shot to land (introDone) */}
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          // During the shot the headline waits for the dolly to land.
          if (opening.state !== "playing") setIntroDone(true);
        }}
      >
        {loading && <Slate shot={shot} />}
      </AnimatePresence>
      {!loading && (
        <>
          {/* The opening shot plays without chrome (nav, launcher, scroll cue); they arrive with the headline.
              Opacity 1 creates no stacking context, so the fixed nav layers as before. */}
          <div
            style={{
              opacity: shot && !introDone ? 0 : 1,
              pointerEvents: shot && !introDone ? "none" : undefined,
              transition: "opacity 0.8s ease",
            }}
          >
            <Navbar onCmd={() => setCmdOpen(true)} />
          </div>
          <main id="main" tabIndex={-1} className="relative z-10 outline-none">
            <HeroBold introDone={introDone} />
            <CabinMap />
            <ProjectsBold />
            <Suspense fallback={<div className="min-h-screen" />}>
              <AboutBold />
              <SkillsMarquee />
              <ScrollCinema />
              <CodingStatsBold />
              <JourneyTimeline />
              <NowSection />
              <Fretboard />
              <BeyondCodeBento />
              {/* The launcher waits for the opening shot to land, like the nav. */}
              <div style={{ opacity: shot && !introDone ? 0 : 1, transition: "opacity 0.8s ease" }}>
                <PortfolioBot />
              </div>
              {/* Achievements are the last section before Contact; the footer closes the page. */}
              <AchievementsSection />
              <ContactBold />
              <Footer />
            </Suspense>
          </main>
          <Shell isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
          {/* Desktop dock: shell, current scene, assistant (Dock.jsx) */}
          <Dock onShell={() => setCmdOpen(true)} scenes />
        </>
      )}
    </>
  );
}
