/**
 * Plucked-string synth (Karplus-Strong) for the riff games. Each pluck is a
 * short burst of noise fed through a delay line the length of one period,
 * with a two-tap average as the loop filter — the classic cheap guitar.
 * Buffers are rendered once per pitch and cached. Nothing here touches the
 * network, so the CSP needs no media-src.
 */
export function createPlucker() {
  let ctx = null
  const cache = new Map()

  function context() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === "suspended") ctx.resume()
    return ctx
  }

  function render(freq) {
    const rate = ctx.sampleRate
    const seconds = 1.6
    const n = Math.round(rate / freq)
    const out = ctx.createBuffer(1, Math.round(rate * seconds), rate)
    const data = out.getChannelData(0)
    const ring = new Float32Array(n)
    for (let i = 0; i < n; i++) ring[i] = Math.random() * 2 - 1
    // Lower strings ring longer; the brightness filter is slightly stronger up high.
    const decay = freq < 150 ? 0.998 : 0.996
    let idx = 0
    for (let i = 0; i < data.length; i++) {
      const cur = ring[idx]
      const next = ring[(idx + 1) % n]
      ring[idx] = decay * 0.5 * (cur + next)
      data[i] = cur
      idx = (idx + 1) % n
    }
    return out
  }

  return {
    /** Call from a user gesture at least once so the context can start. */
    warm() {
      context()
    },
    pluck(freq, gain = 0.5) {
      const c = context()
      if (!c) return
      const key = Math.round(freq * 10)
      let buf = cache.get(key)
      if (!buf) {
        buf = render(freq)
        cache.set(key, buf)
      }
      const src = c.createBufferSource()
      src.buffer = buf
      const g = c.createGain()
      g.gain.value = gain
      src.connect(g).connect(c.destination)
      src.start()
    },
  }
}
