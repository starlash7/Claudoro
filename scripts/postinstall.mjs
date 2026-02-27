import { spawnSync } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const result = spawnSync(npmCommand, ['exec', 'electron-builder', 'install-app-deps'], {
  stdio: 'inherit'
})

if (result.error || result.status !== 0) {
  console.warn(
    '[postinstall] Native dependency rebuild failed. Continuing with fallback mode (keychain integration may be limited).'
  )
  process.exit(0)
}
