import { useEffect, useState } from "react"
import { usePrefersReducedMotion } from "../context/motion"

const LINES = [
  { p: "aayush@portfolio:~$ ", c: "whoami" },
  { p: "", c: "→ CS student • full-stack dev • problem solver" },
  { p: "aayush@portfolio:~$ ", c: "cat stack.txt" },
  { p: "", c: "React · Node · MongoDB · Express · C++" },
  { p: "aayush@portfolio:~$ ", c: "git log --oneline -1" },
  { p: "", c: "feat: shipped 12 repos, solved 399 problems 🚀" },
]

export default function TerminalCard({ className = "" }) {
  const reduced = usePrefersReducedMotion()
  const [done, setDone] = useState([])
  const [cur, setCur] = useState("")
  const [li, setLi] = useState(0)

  useEffect(() => {
    if (reduced || li >= LINES.length) return
    const full = LINES[li].c
    let i = 0
    const id = setInterval(() => {
      i++
      setCur(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(id)
        setTimeout(() => {
          setDone((d) => [...d, LINES[li]])
          setCur("")
          setLi((n) => n + 1)
        }, 450)
      }
    }, 38)
    return () => clearInterval(id)
  }, [li, reduced])

  const render = reduced ? LINES : done

  return (
    <div className={"glass overflow-hidden font-mono text-sm " + className}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
        <span className="h-3 w-3 rounded-full bg-green-400/80" />
        <span className="ml-2 text-white/40 text-xs">zsh — aayush</span>
      </div>
      <div className="p-5 space-y-1 leading-relaxed">
        {render.map((l, i) => (
          <div key={i}>
            <span className="text-emerald-400">{l.p}</span>
            <span className={l.p ? "text-white/90" : "text-cyan-300"}>{l.c}</span>
          </div>
        ))}
        {!reduced && li < LINES.length && (
          <div>
            <span className="text-emerald-400">{LINES[li].p}</span>
            <span className={LINES[li].p ? "text-white/90" : "text-cyan-300"}>{cur}</span>
            <span className="inline-block w-2 h-4 ml-0.5 bg-cyan-300 animate-pulse align-middle" />
          </div>
        )}
      </div>
    </div>
  )
}
