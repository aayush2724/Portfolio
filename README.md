# Aayush's Portfolio

Personal portfolio built with React, Vite and Tailwind CSS.

🔗 **Live:** [aayush-2724.vercel.app](https://aayush-2724.vercel.app/)

## Run locally

```bash
npm install
npm run dev     # dev server
npm run check   # lint + test + build
```

## Live "Currently vibing to" card

The Beyond Code section can show what's playing right now. YouTube Music has no
listening API, so plays reach the site through Last.fm: Web Scrobbler (browser)
or Pano Scrobbler (Android) scrobbles each play, and the card polls Last.fm's
public recent-tracks endpoint every 30 seconds while it is on screen.

1. Create a Last.fm account and a read-only API key at last.fm/api/account/create.
2. Copy `.env.example` to `.env.local` and fill in `VITE_LASTFM_USER` and
   `VITE_LASTFM_API_KEY`. Add the same two variables to the Vercel project
   settings and redeploy.
3. Leave both unset and the card shows its static fallback.

## Links

- 💻 **GitHub:** [github.com/aayush2724](https://github.com/aayush2724)
- 💼 **LinkedIn:** [linkedin.com/in/aayush2724](https://linkedin.com/in/aayush2724)
