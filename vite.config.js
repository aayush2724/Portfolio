import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js/drei are reached only through dynamic imports (the desktop-only
    // ShaderScene and the LazyDevPage modal), so Rollup's default splitting
    // already keeps them out of the entry chunk.
    //
    // An explicit manualChunks rule was worse here: it swept Vite's
    // __vitePreload helper into the WebGL chunk, which made the entry statically
    // import all ~260KB gzip of three.js on every device, phones included.
    chunkSizeWarningLimit: 1000,
  },
})
