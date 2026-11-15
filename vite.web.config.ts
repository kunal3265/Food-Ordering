// Static build for hosts such as Vercel: the browser bundle only, without the
// Cloudflare Worker, so the output is a plain folder of assets Vite can serve.
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: { outDir: 'dist-web', emptyOutDir: true },
})
