import { describe, expect, it } from "vitest"
import { buildRecentTracksUrl, formatRelative, parseRecentTracks, pickArt } from "./nowPlaying"

const ART = "https://lastfm.freetls.fastly.net/i/u/300x300/abc123.png"
const PLACEHOLDER = "https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png"

const image = (url) => [
  { size: "small", "#text": url.replace("300x300", "34s") },
  { size: "medium", "#text": url.replace("300x300", "64s") },
  { size: "large", "#text": url.replace("300x300", "174s") },
  { size: "extralarge", "#text": url },
]

const live = {
  artist: { mbid: "", "#text": "Led Zeppelin" },
  image: image(ART),
  album: { mbid: "", "#text": "Led Zeppelin IV" },
  name: "Stairway to Heaven",
  "@attr": { nowplaying: "true" },
  url: "https://www.last.fm/music/Led+Zeppelin/_/Stairway+to+Heaven",
}

const scrobbled = {
  artist: { mbid: "", "#text": "Pink Floyd" },
  image: image(PLACEHOLDER),
  album: { mbid: "", "#text": "" },
  name: "Time",
  url: "https://www.last.fm/music/Pink+Floyd/_/Time",
  date: { uts: "1700000000", "#text": "14 Nov 2023, 22:13" },
}

describe("parseRecentTracks", () => {
  it("reads a now-playing track with its cover", () => {
    const t = parseRecentTracks({ recenttracks: { track: [live, scrobbled] } })
    expect(t).toEqual({
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      album: "Led Zeppelin IV",
      art: ART,
      url: live.url,
      nowPlaying: true,
      playedAt: null,
    })
  })

  it("reads the last scrobble when nothing is playing", () => {
    const t = parseRecentTracks({ recenttracks: { track: [scrobbled] } })
    expect(t.nowPlaying).toBe(false)
    expect(t.playedAt).toBe(1700000000 * 1000)
    expect(t.album).toBeNull()
    expect(t.art).toBeNull()
  })

  it("accepts a single track object and extended-mode artist shape", () => {
    const t = parseRecentTracks({
      recenttracks: { track: { ...scrobbled, artist: { name: "Pink Floyd", url: "" } } },
    })
    expect(t.artist).toBe("Pink Floyd")
  })

  it("returns null for empty, malformed or error responses", () => {
    expect(parseRecentTracks({ recenttracks: { track: [] } })).toBeNull()
    expect(parseRecentTracks({ error: 6, message: "User not found" })).toBeNull()
    expect(parseRecentTracks(null)).toBeNull()
    expect(parseRecentTracks({ recenttracks: { track: [{ name: "" }] } })).toBeNull()
  })
})

describe("pickArt", () => {
  it("prefers the largest size and rejects the placeholder star", () => {
    expect(pickArt(image(ART))).toBe(ART)
    expect(pickArt(image(PLACEHOLDER))).toBeNull()
    expect(pickArt([{ size: "small", "#text": "" }])).toBeNull()
    expect(pickArt(undefined)).toBeNull()
  })
})

describe("formatRelative", () => {
  const now = Date.parse("2026-11-06T12:00:00Z")
  const ago = (ms) => formatRelative(now - ms, now)
  it("floors to the largest whole unit", () => {
    expect(ago(5_000)).toBe("just now")
    expect(ago(4 * 60_000)).toBe("4m ago")
    expect(ago(2 * 3_600_000 + 59 * 60_000)).toBe("2h ago")
    expect(ago(3 * 86_400_000)).toBe("3d ago")
    expect(ago(13 * 86_400_000)).toBe("1w ago")
    expect(ago(45 * 86_400_000)).toBe("1mo ago")
    expect(ago(400 * 86_400_000)).toBe("1y ago")
  })
  it("never goes negative for clock skew", () => {
    expect(formatRelative(now + 60_000, now)).toBe("just now")
  })
})

describe("buildRecentTracksUrl", () => {
  it("targets the recent-tracks method with one JSON result", () => {
    const url = new URL(buildRecentTracksUrl({ user: "some one", apiKey: "k3y" }))
    expect(url.origin).toBe("https://ws.audioscrobbler.com")
    expect(url.searchParams.get("method")).toBe("user.getrecenttracks")
    expect(url.searchParams.get("user")).toBe("some one")
    expect(url.searchParams.get("api_key")).toBe("k3y")
    expect(url.searchParams.get("format")).toBe("json")
    expect(url.searchParams.get("limit")).toBe("1")
  })
})
