import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Production security headers live in vercel.json (Vercel applies them at the
 * edge). `vite preview` mirrors the site-wide set so a CSP regression shows up
 * in the local console instead of after a deploy. upgrade-insecure-requests is
 * dropped for the plain-http preview server.
 */
const vercel = JSON.parse(readFileSync(resolve(__dirname, 'vercel.json'), 'utf8'))
const previewHeaders = Object.fromEntries(
  (vercel.headers || [])
    .filter((rule) => rule.source === '/(.*)')
    .flatMap((rule) => rule.headers)
    .map(({ key, value }) => [key, value.replace(/;\s*upgrade-insecure-requests/, '')])
)

export default defineConfig({
  plugins: [react()],
  preview: { headers: previewHeaders },
  build: {
    // Three HTML entries: the app, the custom 404 Vercel serves for unknown
    // paths, and the privacy page. The two static pages share index.css so
    // they pick up the design tokens and self-hosted fonts.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        notFound: resolve(__dirname, '404.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
    // three.js/drei are reached only through dynamic imports (the desktop-only
    // ShaderScene and the LazyDevPage modal), so Rollup's default splitting
    // already keeps them out of the entry chunk.
    //
    // An explicit manualChunks rule was worse here: it swept Vite's
    // __vitePreload helper into the WebGL chunk, which made the entry statically
    // import all ~260KB gzip of three.js on every device, phones included.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
