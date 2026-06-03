import Reveal from "./Reveal"
import CommandLabel from "./CommandLabel"

export default function AboutBold() {
  return (
    <section id="about" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        
        {/* Command Label */}
        <Reveal>
          <CommandLabel className="mb-6">cat about.md</CommandLabel>
        </Reveal>

        {/* Manifesto */}
        <Reveal>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight mb-16">
            Building digital experiences that solve{" "}
            <span style={{ color: "var(--accent)" }}>real problems</span>, one line of code at a time.
          </h2>
        </Reveal>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          
          {/* Left: Bio */}
          <Reveal delay={0.2}>
            <div className="space-y-6">
              <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
                Hey! I'm Aayush, a Computer Science student passionate about full-stack development and solving complex problems. I transform ideas into scalable applications that make a difference.
              </p>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
                From building a{" "}
                <span style={{ color: "var(--fg)" }}>citizen complaint resolution platform</span>{" "}
                to creating an{" "}
                <span style={{ color: "var(--fg)" }}>ML-powered chord detector</span>{" "}
                for guitarists, I love projects that blend technology with purpose.
              </p>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
                When I'm not coding, you'll find me playing{" "}
                <span style={{ color: "var(--fg)" }}>Stairway to Heaven</span>{" "}
                on my guitar or grinding{" "}
                <span style={{ color: "var(--fg)" }}>LeetCode problems</span>.
              </p>
            </div>
          </Reveal>

          {/* Right: Quick Facts */}
          <Reveal delay={0.3}>
            <div className="space-y-6">
              <h3 className="font-display text-2xl uppercase mb-6" style={{ color: "var(--accent)" }}>
                Quick Facts
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]" style={{ borderColor: "var(--line)" }}>
                    <span className="text-sm transition-all duration-300 group-hover:scale-110">🎓</span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--fg)" }}>Education</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Computer Science Student</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]" style={{ borderColor: "var(--line)" }}>
                    <span className="text-sm transition-all duration-300 group-hover:scale-110">📍</span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--fg)" }}>Location</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>India (Asia/Calcutta)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]" style={{ borderColor: "var(--line)" }}>
                    <span className="text-sm transition-all duration-300 group-hover:scale-110">💼</span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--fg)" }}>Available For</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Full-time roles, internships, freelance projects</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]" style={{ borderColor: "var(--line)" }}>
                    <span className="text-sm transition-all duration-300 group-hover:scale-110">⚡</span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--fg)" }}>Interests</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Guitar, DSA, System Design, Open Source</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]" style={{ borderColor: "var(--line)" }}>
                    <span className="text-sm transition-all duration-300 group-hover:scale-110">🎸</span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--fg)" }}>Favorite Song</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Stairway to Heaven - Led Zeppelin</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
