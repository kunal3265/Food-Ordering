// Opens the standalone build in the default browser (Windows, macOS, Linux).
import { exec } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const url = pathToFileURL(resolve('dist-file', 'index.html')).href
const command = process.platform === 'win32'
  ? 'start "" "' + url + '"'
  : process.platform === 'darwin'
    ? 'open "' + url + '"'
    : 'xdg-open "' + url + '"'

exec(command, (err) => {
  if (err) console.error('Could not open the browser:', err.message)
  else console.log('Opened', url)
})
