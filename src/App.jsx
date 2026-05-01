import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CustomCursor from "./components/CustomCursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Life from "./components/Life";
import Timeline from "./components/Timeline";
import Contact from "./components/Contact";
import CommandPalette from "./components/CommandPalette";
import LeetcodeStats from "./components/LeetcodeStats";
import GitHubProjects from "./components/GithubProjects";
import MarqueeTicker from "./components/MarqueeTicker";

function Loader() {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#04040a] flex flex-col items-center justify-center gap-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-display font-extrabold text-6xl text-white"
      >
        <span className="ga">A</span>
        <span className="text-white/70">ayush</span>
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "140px" }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-mono text-xs text-white/15 tracking-widest blink"
      >
        loading
      </motion.p>
    </motion.div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
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
      <CustomCursor />
      <AnimatePresence mode="wait">{loading && <Loader />}</AnimatePresence>
      {!loading && (
        <>
          <Navbar onCmd={() => setCmdOpen(true)} />
          <main>
            <Hero />
            <MarqueeTicker />
            <About />
            <Skills />
            <LeetcodeStats />
            <GitHubProjects />
            <Projects />
            <Life />
            <Timeline />
            <Contact />
          </main>
          <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
            onClick={() => setCmdOpen(true)}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 gc border border-white/8 rounded-full px-5 py-2 text-xs font-mono text-white/25 hover:text-amber-400 hover:border-amber-500/25 transition-all duration-300"
          >
            Press{" "}
            <kbd className="border border-white/10 rounded px-1.5 py-0.5 text-white/35">
              ⌘K
            </kbd>{" "}
            to navigate
          </motion.button>
        </>
      )}
    </>
  );
}
