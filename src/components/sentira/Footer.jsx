import { Github, Linkedin, Instagram, Code2 } from "lucide-react"

/**
 * Four link columns over a thin legal bar. Column headings are set in the body
 * sans at the same size as the links and separated only by weight — the
 * reference never lets a footer heading compete with page headings, and a
 * serif or an uppercase tracking treatment here would do exactly that.
 */

const COLUMNS = [
  {
    title: "Navigate",
    links: [
      { label: "Home", href: "#hero" },
      { label: "About", href: "#about" },
      { label: "What I do", href: "#services" },
      { label: "How I work", href: "#process" },
    ],
  },
  {
    title: "Work",
    links: [
      { label: "Selected work", href: "#work" },
      { label: "Journey", href: "#journey" },
      { label: "FAQ", href: "#faq" },
      { label: "Résumé", href: "/resume.pdf", external: true },
    ],
  },
  {
    title: "Projects",
    links: [
      { label: "Auralis", href: "https://github.com/aayush2724/auralisAI", external: true },
      { label: "DeskGuard", href: "https://deskguard-jade.vercel.app", external: true },
      { label: "LeadForge", href: "https://lead-forge-rust.vercel.app", external: true },
      { label: "AlgoVision", href: "https://github.com/aayush2724/AlgoVision", external: true },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: "https://github.com/aayush2724", icon: Github, external: true },
      { label: "LinkedIn", href: "https://linkedin.com/in/aayush2724", icon: Linkedin, external: true },
      { label: "LeetCode", href: "https://leetcode.com/aayush2724", icon: Code2, external: true },
      { label: "Instagram", href: "https://instagram.com/aayussh.27", icon: Instagram, external: true },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative px-5 pb-10 md:px-10">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-2 gap-10 pb-14 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-5 text-[15px] font-semibold">{col.title}</p>
              <ul className="flex flex-col gap-3.5">
                {col.links.map((l) => {
                  const Icon = l.icon
                  return (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        {...(l.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="link-underline inline-flex items-center gap-2 text-sm transition-colors duration-300 hover:text-white"
                        style={{ color: "var(--muted)" }}
                      >
                        {Icon && <Icon size={13} className="shrink-0" />}
                        {l.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col gap-2 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: "1px solid var(--line)", color: "var(--muted)" }}
        >
          <p>© {new Date().getFullYear()} Aayush Kumar. All rights reserved.</p>
          <p>
            Designed &amp; built in React —{" "}
            <a
              href="https://github.com/aayush2724/Portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
              style={{ color: "var(--fg)" }}
            >
              source
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
