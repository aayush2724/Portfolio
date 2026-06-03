import { useEffect, useRef, useState } from "react"

/* traffic-light dots */
function Dots() {
  return (
    <div className="flex gap-1.5">
      <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
      <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
      <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
    </div>
  )
}

function Caret() {
  return (
    <span className="ml-0.5 inline-block h-[1.05em] w-[0.5ch] translate-y-[0.15em] animate-pulse bg-[var(--accent)]" />
  )
}

/* one command + its output */
export function Block({ path = "~", cmd, out, typing = false }) {
  return (
    <div className="mb-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[var(--accent)]">➜</span>
        <span className="text-[var(--muted)]">{path}</span>
        <span className="text-[var(--fg)]">
          {cmd}
          {typing && <Caret />}
        </span>
      </div>
      {out != null && out !== "" && (
        <pre className="mt-1 whitespace-pre-wrap font-mono text-[var(--muted)]">{out}</pre>
      )}
    </div>
  )
}

/* static window — drop any children inside */
export function Terminal({ title = "aayush@portfolio — zsh", className = "", children }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] font-mono text-sm shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-[var(--line)] bg-white/[0.02] px-4 py-2.5">
        <Dots />
        <span className="text-xs text-[var(--muted)]">{title}</span>
      </div>
      <div className="p-4 leading-relaxed">{children}</div>
    </div>
  )
}

/* animated window — types a sequence of { cmd, out } */
export function TypingTerminal({
  title = "aayush@portfolio — zsh",
  path = "~",
  steps = [],
  className = "",
}) {
  const [done, setDone] = useState([])     // committed { cmd, out }
  const [curCmd, setCurCmd] = useState("")  // partial command
  const [curOut, setCurOut] = useState(null)
  const timers = useRef([])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(steps)
      return
    }
    let cancelled = false
    const wait = (ms) =>
      new Promise((res) => timers.current.push(setTimeout(res, ms)))

    ;(async () => {
      for (let i = 0; i < steps.length && !cancelled; i++) {
        const { cmd, out } = steps[i]
        for (let c = 1; c <= cmd.length && !cancelled; c++) {
          setCurCmd(cmd.slice(0, c))
          await wait(38)
        }
        await wait(260)
        setCurOut(out ?? "")
        await wait(560)
        setDone((d) => [...d, { cmd, out }])
        setCurCmd("")
        setCurOut(null)
        await wait(360)
      }
    })()

    return () => {
      cancelled = true
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [steps])

  const typingNow = curCmd !== "" || curOut !== null

  return (
    <Terminal title={title} className={className}>
      {done.map((s, i) => (
        <Block key={i} path={path} cmd={s.cmd} out={s.out} />
      ))}
      {typingNow && <Block path={path} cmd={curCmd} out={curOut} typing={curOut === null} />}
    </Terminal>
  )
}
