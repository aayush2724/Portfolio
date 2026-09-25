# Share image & app icons

`public/og-image.png` (2400×1260) and the PNG icons are screenshots of these
two pages, so they use the site's real fonts and colours.

To regenerate after changing the copy or the accent:

1. `cd scripts/og && python3 -m http.server 4174`
2. Open `http://localhost:4174/og.html` in Chrome at a 1200×630 viewport,
   device pixel ratio 2, and save a viewport screenshot as `public/og-image.png`.
3. Open `icon.html` at 1024×1024, screenshot it, and resize to
   `icon-512.png`, `icon-192.png` and `apple-touch-icon.png` (180) in `public/`.
