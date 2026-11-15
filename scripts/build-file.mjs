// Builds a single, self-contained HTML file you can open directly from disk
// (no dev server, no localhost). Images stay in ./images next to the file.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { build } from 'vite'

const root = process.cwd()
const outDir = 'dist-file'

await build({
  configFile: false,
  root,
  base: './',
  publicDir: 'public',
  plugins: [react(), tailwindcss()],
  build: {
    outDir,
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})

const dir = resolve(root, outDir)
const htmlPath = resolve(dir, 'index.html')
const assetsDir = resolve(dir, 'assets')
const cssName = readdirSync(assetsDir).find((f) => f.endsWith('.css'))

const js = readFileSync(resolve(dir, 'app.js'), 'utf8').split('</script').join('<\/script')
const css = cssName ? readFileSync(resolve(assetsDir, cssName), 'utf8') : ''

let html = readFileSync(htmlPath, 'utf8')
html = html.replace(/<link rel="modulepreload"[^>]*>/g, '')

// Inline the app stylesheet, leaving the Google Fonts links alone.
if (css && cssName) {
  const at = html.indexOf('href="./assets/' + cssName + '"')
  if (at !== -1) {
    const open = html.lastIndexOf('<link', at)
    const close = html.indexOf('>', at) + 1
    html = html.slice(0, open) + '<style>' + css + '</style>' + html.slice(close)
  }
}

// The bundle is a classic IIFE, so it runs from file:// where module scripts are blocked.
const jsAt = html.indexOf('src="./app.js"')
if (jsAt !== -1) {
  const open = html.lastIndexOf('<script', jsAt)
  const close = html.indexOf('</script>', jsAt) + '</script>'.length
  // Remove the module tag and run the bundle at the end of <body> instead,
  // so the page is parsed and #root exists before React mounts.
  html = html.slice(0, open) + html.slice(close)
  html = html.split('</body>').join('<script>' + js + '</script></body>')
}
html = html.split('href="/favicon.svg"').join('href="./favicon.svg"')
writeFileSync(htmlPath, html)
console.log('Single-file build ready:', htmlPath)
