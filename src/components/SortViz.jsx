import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/** Animated bubble-sort bars. Decorative DSA flavor. */
export default function SortViz({ count = 28 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: "-40px" })
  const reduced = usePrefersReducedMotion()
  const [bars, setBars] = useState([])

  useEffect(() => {
    setBars(Array.from({ length: count }, () => 10 + Math.random() * 90))
  }, [count])

  useEffect(() => {
    if (!inView || reduced) return
    let arr = [...bars], i = 0, j = 0
    const id = setInterval(() => {
      if (i >= arr.length) { // reshuffle + repeat
        arr = Array.from({ length: count }, () => 10 + Math.random() * 90)
        i = 0; j = 0
      }
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
      }
      j++
      if (j >= arr.length - i - 1) { j = 0; i++ }
      setBars([...arr])
    }, 40)
    return () => clearInterval(id)
  }, [inView, reduced, count]) // eslint-disable-line

  return (
    <div ref={ref} className="glass p-5 rounded-2xl border border-white/7">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-cyan-400">bubbleSort()</span>
        <span className="font-mono text-xs text-white/40">O(n²)</span>
      </div>
      <div className="flex items-end gap-[3px] h-32">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-violet-600 to-cyan-300 transition-all duration-75"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}
