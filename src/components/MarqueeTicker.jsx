/**
 * MarqueeTicker — scrolling strip between sections
 * Shows tech stack, achievements, personality snippets
 */
const items = [
  "React",
  "Node.js",
  "Python",
  "C++",
  "TypeScript",
  "MongoDB",
  "Framer Motion",
  "350+ LeetCode",
  "10+ Projects",
  "AI Pipelines",
  "WebSockets",
  "Full‑Stack Dev",
  "Guitarist 🎸",
  "DSA Enthusiast",
  "Open Source",
  "2nd Year CS",
];

const Sep = () => (
  <span className="mx-6 text-amber-500/30 select-none">✦</span>
);

export default function MarqueeTicker() {
  const doubled = [...items, ...items]; // double for seamless loop

  return (
    <div className="py-5 border-y border-white/[0.04] overflow-hidden bg-white/[0.012]">
      <div className="marquee-inner gap-0">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="font-mono text-xs tracking-[0.15em] uppercase text-white/25 hover:text-amber-400/70 transition-colors duration-200 cursor-default">
              {item}
            </span>
            <Sep />
          </span>
        ))}
      </div>
    </div>
  );
}
