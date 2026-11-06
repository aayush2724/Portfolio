---
title: What I'm listening to, live
date: 2026-11-06
summary: YouTube Music has no API for this, so the "Currently vibing to" card takes the scenic route through a scrobbler and Last.fm.
tags: [portfolio, music, react]
---

The Beyond Code section has had a "Currently vibing to" card for a while. It said Stairway to Heaven. It always said Stairway to Heaven, because it was a string in a component.

I listen on YouTube Music, which exposes nothing about what's playing. Every live now-playing widget on the web solves this the same way: a scrobbler. Web Scrobbler in the browser, and Pano Scrobbler on Android, watch the player and send each play to Last.fm. Last.fm then has a public endpoint that returns the most recent track, flagged if it's playing right now, with album art.

## What the site does

A hook polls that endpoint every thirty seconds, but only while the card is near the viewport and the tab is visible. The response is parsed into one track: title, artist, album, cover, and whether it's live. If something is playing, the card shows the cover with a lime label and three bouncing equaliser bars. If not, it shows the last play and how long ago it was. If the request fails, it keeps whatever it had. If nothing is configured, it falls back to Stairway to Heaven, which is at least honest.

The parsing is a pure function with tests, because Last.fm's JSON has a few quirks: the artist field changes shape depending on a query flag, a single result can arrive as an object instead of an array, and missing art comes back as a placeholder image rather than nothing.

The API key is read-only and lives in an environment variable. The request goes from your browser to Last.fm for my public profile, the same as loading an image from a CDN, and nothing about you is stored anywhere.
