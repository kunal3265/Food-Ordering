// Rebuilds the standalone HTML whenever the source changes, so a plain
// Ctrl+F5 in the browser picks up your edits (no dev server involved).
import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
let running = false
let queued = false

const build = () => {
  if (running) {
    queued = true
    return
  }
  running = true
  const started = Date.now()
  const child = spawn(process.execPath, [resolve(root, 'scripts/build-file.mjs')], { stdio: 'inherit' })
  child.on('exit', (code) => {
    running = false
    console.log(code === 0 ? `Rebuilt in ${Date.now() - started}ms - press Ctrl+F5 in the browser.` : 'Build failed - fix the error above.')
    if (queued) {
      queued = false
      build()
    }
  })
}

build()

let timer
const onChange = () => {
  clearTimeout(timer)
  timer = setTimeout(build, 250)
}
watch(resolve(root, 'src'), { recursive: true }, onChange)
console.log('Watching src/ - save a file and the HTML rebuilds itself.')
