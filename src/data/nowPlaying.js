/**
 * Live "Currently vibing to" data, read from Last.fm.
 *
 * YouTube Music has no listening API, so plays reach the site the way every
 * now-playing widget on the web does: a scrobbler (Web Scrobbler in the
 * browser, Pano Scrobbler on Android) pushes each play to Last.fm, and the
 * card polls Last.fm's public recent-tracks endpoint. The key is read-only —
 * it can see a public profile, nothing more — so it is safe in the bundle.
 *
 * Pure functions only; the polling hook lives in context/useNowPlaying.js so
 * these can be unit-tested against recorded API responses.
 */

export const LASTFM_ENDPOINT = "https://ws.audioscrobbler.com/2.0/"

/** Last.fm returns this star image (by hash) when it has no art for a track. */
const PLACEHOLDER_ART = "2a96cbd8b46e442fc41c2b86b821562f"

const ART_SIZES = ["extralarge", "large", "medium", "small"]

export function buildRecentTracksUrl({ user, apiKey, limit = 1 }) {
  const url = new URL(LASTFM_ENDPOINT)
  url.searchParams.set("method", "user.getrecenttracks")
  url.searchParams.set("user", user)
  url.searchParams.set("api_key", apiKey)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", String(limit))
  return url.toString()
}

/** Largest usable cover; null for the placeholder or when no art is listed. */
export function pickArt(images) {
  if (!Array.isArray(images)) return null
  for (const size of ART_SIZES) {
    const hit = images.find((i) => i && i.size === size && typeof i["#text"] === "string" && i["#text"])
    if (hit) return hit["#text"].includes(PLACEHOLDER_ART) ? null : hit["#text"]
  }
  return null
}

// Artist/album are `{ "#text": "..." }` normally and `{ name: "..." }` with extended=1.
function text(value) {
  if (typeof value === "string") return value
  if (value && typeof value === "object") return value["#text"] || value.name || ""
  return ""
}

/**
 * First track of a user.getrecenttracks response → one normalised track, or
 * null when the profile has no scrobbles yet. With a track playing, Last.fm
 * puts it first with `@attr.nowplaying: "true"` and no `date`.
 */
export function parseRecentTracks(json) {
  const raw = json?.recenttracks?.track
  const list = Array.isArray(raw) ? raw : raw ? [raw] : []
  const t = list[0]
  if (!t || typeof t.name !== "string" || !t.name) return null

  const nowPlaying = t["@attr"]?.nowplaying === "true"
  const uts = Number(t.date?.uts)
  return {
    title: t.name,
    artist: text(t.artist),
    album: text(t.album) || null,
    art: pickArt(t.image),
    url: typeof t.url === "string" ? t.url : null,
    nowPlaying,
    playedAt: !nowPlaying && Number.isFinite(uts) && uts > 0 ? uts * 1000 : null,
  }
}

/** "just now" / "4m ago" / "2h ago" / "3d ago" — floored, like a chat timestamp. */
export function formatRelative(thenMs, nowMs = Date.now()) {
  const s = Math.max(0, Math.floor((nowMs - thenMs) / 1000))
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  const w = Math.floor(d / 7)
  if (w < 5) return `${w}w ago`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(d / 365)}y ago`
}
