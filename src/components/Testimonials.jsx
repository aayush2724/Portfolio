import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Reveal from "./Reveal"
import CommandLabel from "./CommandLabel"

const TESTIMONIALS = [
  {
    id: 1,
    name: "Kaki Harshita",
    role: "Hackathon Teammate · Panic-At-The-Deadline",
    text: "Aayush is the kind of teammate who turns chaos into shipped products. During ThinkRoot x Vortex'26, he built the entire LeadForge backend in under 8 hours while I handled the frontend. His ability to stay calm under pressure is unmatched.",
    avatar: "KH",
  },
  {
    id: 2,
    name: "NIE Faculty",
    role: "The National Institute of Engineering, Mysore",
    text: "Aayush consistently demonstrates strong problem-solving skills and a genuine passion for building impactful software. His work on the Citizen Resolver System showed real-world application of full-stack development for civic tech.",
    avatar: "NF",
  },
  {
    id: 3,
    name: "Open Source Contributor",
    role: "GitHub Community",
    text: "I've reviewed several of Aayush's repositories. His code is clean, well-documented, and follows best practices. The AlgoVision project in particular is a great educational resource that makes algorithms accessible.",
    avatar: "OC",
  },
]

function TestimonialCard({ testimonial, isActive }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isActive ? 1 : 0.4, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border p-8 md:p-10 transition-all duration-300"
      style={{
        borderColor: isActive ? "rgba(212, 255, 63, 0.2)" : "var(--line)",
        background: isActive ? "rgba(212, 255, 63, 0.03)" : "var(--surface)",
      }}
    >
      {/* Quote mark */}
      <div className="font-display text-6xl leading-none mb-4" style={{ color: "var(--accent)", opacity: 0.3 }}>
        "
      </div>

      {/* Text */}
      <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: "var(--fg)" }}>
        {testimonial.text}
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-sm"
          style={{ background: "rgba(212, 255, 63, 0.1)", color: "var(--accent)" }}
        >
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-display font-semibold text-sm" style={{ color: "var(--fg)" }}>
            {testimonial.name}
          </p>
          <p className="font-mono text-xs" style={{ color: "var(--muted)" }}>
            {testimonial.role}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Testimonials() {
  const [active, setActive] = useState(0)

  return (
    <section id="testimonials" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <Reveal>
          <div className="mb-16">
            <CommandLabel className="mb-6">cat testimonials.md</CommandLabel>
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
              What People Say
            </p>
            <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">
              Testimonials
            </h2>
          </div>
        </Reveal>

        {/* Testimonial Cards */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.id} onMouseEnter={() => setActive(i)}>
                <TestimonialCard testimonial={t} isActive={active === i} />
              </div>
            ))}
          </div>
        </Reveal>

        {/* Dots */}
        <Reveal delay={0.2}>
          <div className="flex justify-center gap-3 mt-10">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: active === i ? "var(--accent)" : "var(--line)",
                  transform: active === i ? "scale(1.4)" : "scale(1)",
                }}
                aria-label={`Show testimonial ${i + 1}`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
