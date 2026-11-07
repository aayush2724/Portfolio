import { useEffect, useState } from "react"
import { buildRecentTracksUrl, parseRecentTracks } from "../data/nowPlaying"

const POLL_MS = 30_000

// Inlined by Vite at build time. Unset locally and on Vercel until the
// Last.fm account exists; the cards then show their static fallback.
export const LASTFM_USER = import.meta.env.VITE_LASTFM_USER
export const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY

// One answer shared by every card on the page (Now and Beyond Code), so two
// cards never double-poll and one scrolling into view starts from the last
// result instead of refetching.
const cache = { track: null, at: 0 }

/**
 * Polls Last.fm for the most recent track while `active` (the card is on
 * screen) and the tab is visible. A failed request keeps the last good track
 * rather than blanking the card; a profile with no scrobbles yields null.
 */
export function useNowPlaying({ active = true } = {}) {
  const [track, setTrack] = useState(cache.track)
  const configured = Boolean(LASTFM_USER && LASTFM_API_KEY)

  useEffect(() => {
    if (!configured || !active) return
    let cancelled = false
    let timer
    const controller = new AbortController()
    const url = buildRecentTracksUrl({ user: LASTFM_USER, apiKey: LASTFM_API_KEY })
    if (cache.track) setTrack(cache.track)

    function schedule(delay = POLL_MS) {
      clearTimeout(timer)
      timer = setTimeout(tick, delay)
    }

    async function tick() {
      if (cancelled) return
      if (document.hidden) return // visibilitychange restarts the loop
      cache.at = Date.now()
      try {
        const res = await fetch(url, { signal: controller.signal, cache: "no-store" })
        if (res.ok) {
          const next = parseRecentTracks(await res.json())
          if (next) {
            cache.track = next
            if (!cancelled) setTrack(next)
          }
        }
      } catch {
        // network error or abort — keep whatever is already shown
      }
      if (!cancelled) schedule()
    }

    const onVisibility = () => {
      if (!document.hidden) schedule(0)
    }
    document.addEventListener("visibilitychange", onVisibility)
    schedule(Math.max(0, POLL_MS - (Date.now() - cache.at)))

    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [configured, active])

  return { track, configured }
}
