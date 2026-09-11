import { Mail } from "lucide-react"
import ParticleWave from "./ParticleWave"
import Reveal from "../Reveal"
import { Mark, Pill } from "./ui"

/**
 * The closing statement, set over a second pass of the terrain. This is the one
 * place the mark, the display serif and the terrain appear together, which is
 * what makes it read as a bookend to the hero rather than as one more section.
 *
 * The terrain here runs at reduced intensity — at full strength the ridges
 * compete with the headline, which sits much lower in the frame than the hero's.
 */

const EMAIL = "workwithharshbajpai@gmail.com"

export default function Cta() {
  return (
    <section
      id="contact"
      className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-5 pb-28 pt-32 text-center md:px-10"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%]">
        <ParticleWave height={1} intensity={0.82} />
      </div>

      <Reveal>
        <div className="relative z-10 flex flex-col items-center">
          <span className="mb-6 flex items-center gap-2">
            <Mark size={20} />
            <span className="font-display text-[24px] leading-none">Aayush</span>
          </span>

          <h2 className="font-display display-xl max-w-[16ch] text-[clamp(36px,6.5vw,68px)]">
            Let's build something worth shipping.
          </h2>

          <p
            className="mt-6 max-w-[30rem] text-[15px] leading-[1.6]"
            style={{ color: "var(--muted)" }}
          >
            Open to internships, freelance builds and anything where the
            interesting part is the problem rather than the framework.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Pill as="a" href={`mailto:${EMAIL}`}>
              <Mail size={15} className="-ml-0.5" />
              Email me
            </Pill>
            <Pill
              as="a"
              href="https://linkedin.com/in/aayush2724"
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              arrow
            >
              Connect on LinkedIn
            </Pill>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
