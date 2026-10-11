import { useEffect, useRef, useState } from "react"

/**
 * Turns page scroll into one continuous camera parameter.
 *
 * `store.current.track` runs from 0 (first section) to N-1 (last). The camera
 * holds at station i while section i is being read and travels to i+1 in one
 * smoothstep over the last stretch of section i, arriving exactly as the next
 * section reaches the top of the viewport. Because it is a pure function of
 * scroll (and Lenis already smooths scroll), there is no cut to ease out of.
 *
 * Per-frame consumers read `store.current` (no re-renders); the HUD and the
 * marker layer subscribe to the rarely-changing `scene` state, which flips
 * when the camera is past the halfway point of a move.
 *
 * Sections mount lazily, so the list is rebuilt whenever <main> gains or
 * loses children; otherwise this is a few getBoundingClientRect calls per
 * scroll frame.
 */
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / Math.max(1e-6, b - a)))
  return t * t * (3 - 2 * t)
}

export function useSectionTracker() {
  const store = useRef({ ids: ["hero"], id: "hero", index: 0, count: 1, track: 0, progress: 0, pageProgress: 0, settled: true })
  const [scene, setScene] = useState({ id: "hero", index: 0, count: 1, settled: true })

  useEffect(() => {
    let sections = []
    let raf = 0
    const rescan = () => {
      sections = Array.from(document.querySelectorAll("main section[id]"))
      store.current.ids = sections.map((el) => el.id)
    }

    const update = () => {
      raf = 0
      if (!sections.length) rescan()
      if (!sections.length) return
      const vh = window.innerHeight
      const y = window.scrollY
      // Station i is "reached" a little before section i fills the viewport.
      const anchors = sections.map((el) => el.getBoundingClientRect().top + y - vh * 0.15)
      let i = 0
      while (i < anchors.length - 1 && anchors[i + 1] <= y) i++
      let track = i
      if (i < anchors.length - 1) {
        const span = anchors[i + 1] - anchors[i]
        const travel = Math.min(vh * 0.9, span * 0.6)
        track = i + smoothstep(anchors[i + 1] - travel, anchors[i + 1], y)
      }

      const s = store.current
      const r = sections[i].getBoundingClientRect()
      s.track = track
      s.progress = Math.min(1, Math.max(0, (vh * 0.5 - r.top) / Math.max(1, r.height)))
      const max = document.documentElement.scrollHeight - vh
      s.pageProgress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0

      const idx = Math.round(track)
      const id = sections[idx].id
      // "settled" = within the hold around a station, not mid-travel
      const settled = Math.abs(track - idx) < 0.12
      const changed = id !== s.id || s.count !== sections.length || settled !== s.settled
      s.id = id
      s.index = idx
      s.count = sections.length
      s.settled = settled
      if (changed) setScene({ id, index: idx, count: sections.length, settled })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    rescan()
    update()
    const main = document.getElementById("main") || document.body
    const mo = new MutationObserver(() => {
      rescan()
      schedule()
    })
    mo.observe(main, { childList: true, subtree: true })
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      mo.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(raf)
    }
  }, [])

  return { store, scene }
}
