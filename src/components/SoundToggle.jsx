import { useEffect, useState } from "react"
import { soundOn, setSound, SOUND_EVENT } from "../lib/sound"

/**
 * The site's one sound switch (soft guitar loop, UI ticks, HQ door plucks —
 * see lib/sound.js): four equaliser bars that move while sound is
 * on and rest low while it is off. Same state everywhere it appears (the top
 * bar, the dock on case-study/blog pages, phone page rails).
 */
export default function SoundToggle({ className = "", style, labelled = false }) {
  const [on, setOn] = useState(soundOn)
  useEffect(() => {
    const sync = (e) => setOn(Boolean(e.detail?.on))
    window.addEventListener(SOUND_EVENT, sync)
    return () => window.removeEventListener(SOUND_EVENT, sync)
  }, [])

  return (
    <button
      type="button"
      onClick={() => setSound(!on)}
      aria-pressed={on}
      aria-label="Site sound"
      title={on ? "Sound on — click to mute" : "Sound off — click for soft guitar"}
      className={`inline-flex items-center gap-2 transition-colors hover:text-[var(--fg)] ${className}`}
      style={{ color: on ? "var(--fg)" : "var(--muted)", ...style }}
    >
      <span aria-hidden="true" className={`sound-bars flex h-3.5 items-end gap-[2px] ${on ? "is-on" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ animationDelay: `${i * -0.27}s`, background: on ? "var(--accent)" : "currentColor" }} />
        ))}
      </span>
      {labelled && <span className="font-mono text-[11px] uppercase tracking-[0.16em]">{on ? "sound on" : "sound off"}</span>}
    </button>
  )
}
