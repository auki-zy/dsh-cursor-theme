/**
 * dsh-cursor-theme host: apply cursor theme to the operating system.
 *
 * Cross-platform policy (honest about platform limits):
 *
 *  - Windows: FULL support. Renders each state's PNG into a .cur file under
 *    the profile, writes `HKCU\Control Panel\Cursors`, then refreshes via
 *    `SystemParametersInfo(SPI_SETCURSORS)` so the whole OS picks it up
 *    immediately (Explorer + every app). Restore deletes the overrides.
 *
 *  - macOS: no public API can replace the system cursor (platform fact).
 *    We provide: (a) accessibility-permission detection & guidance to open
 *    System Settings, and (b) export of the theme as .cur/.png files into a
 *    folder so the user can import via a third-party cursor tool. We do not
 *    pretend macOS is natively supported.
 *
 * The client talks to this service over the plugin's webServer routes.
 */

import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pngDataUrlToCur } from './cur.js'
import type { CursorThemeSettings } from './schema.js'

/** Windows cursor registry keys we can map DSH states to. */
const WIN_MAP: Array<[string, string]> = [
  ['default', 'Arrow'],
  ['pointer', 'Hand'],
  ['text', 'IBeam'],
  ['wait', 'Wait'],
  ['help', 'Help'],
  ['not-allowed', 'No'],
  ['crosshair', 'Crosshair'],
  ['resize-ew', 'SizeWE'],
  ['resize-ns', 'SizeNS'],
  ['move', 'SizeAll'],
  ['progress', 'AppStarting'],
  // copy/cell/grabbing have no system cursor — skipped.
]

export type ApplyResult = {
  ok: boolean
  platform: string
  written: string[]
  skipped: string[]
  message?: string
  /** macOS only: whether accessibility permission is granted. */
  accessibilityGranted?: boolean
  /** macOS only: path of the exported cursor folder. */
  exportDir?: string
}

export function currentPlatform(): string {
  return process.platform === 'win32' ? 'win32' : process.platform === 'darwin' ? 'darwin' : process.platform
}

function exec(cmd: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    execFile(cmd, args, { windowsHide: true }, (error, stdout, stderr) => {
      resolve({ code: error ? (error as { code?: number }).code ?? 1 : 0, stdout: String(stdout), stderr: String(stderr) })
    })
  })
}

// ---------- Windows ----------

/**
 * Apply on Windows: write .cur files + registry overrides, then refresh.
 * @param settings - current cursor configuration.
 * @param cursorDir - absolute directory to store .cur files (e.g. profile dir).
 */
export async function applySystemWindows(settings: CursorThemeSettings, cursorDir: string): Promise<ApplyResult> {
  const written: string[] = []
  const skipped: string[] = []
  // System cursors must be ABSOLUTE paths (registry values resolve globally).
  const absDir = resolve(cursorDir)
  mkdirSync(absDir, { recursive: true })

  for (const [stateId, key] of WIN_MAP) {
    const cfg = settings.states?.[stateId]
    if (!cfg?.image) {
      skipped.push(key)
      continue
    }
    const hotspotX = Math.round(cfg.hotspot?.x ?? 0)
    const hotspotY = Math.round(cfg.hotspot?.y ?? 0)
    const curPath = join(absDir, `${stateId}.cur`)
    try {
      const bytes = pngDataUrlToCur(cfg.image, hotspotX, hotspotY)
      writeFileSync(curPath, bytes)
      written.push(key)
      // Windows cursor slots are NAMED VALUES under HKCU\Control Panel\Cursors
      // (not subkeys): reg add "..." /v <Key> /t REG_SZ /d <path> /f
      await exec('reg.exe', ['add', 'HKCU\\Control Panel\\Cursors', '/v', key, '/t', 'REG_SZ', '/d', curPath, '/f'])
    } catch (e) {
      skipped.push(key)
      if (!skipped.includes(key)) {
        // record only first failure reason in message
        void e
      }
    }
  }

  // Refresh system cursors immediately.
  const refresh = await refreshWindowsCursors()
  if (!refresh.ok) {
    return { ok: false, platform: 'win32', written, skipped, message: refresh.message ?? 'Cursor refresh failed' }
  }
  return { ok: true, platform: 'win32', written, skipped }
}

/**
 * Write a temporary PowerShell script and run it to broadcast
 * SPI_SETCURSORS. Using a .ps1 file avoids the command-line quoting
 * hell that breaks inline Add-Type (the earlier failure).
 */
const SPI_SETCURSORS = 0x0057
const SPIF_UPDATEINIFILE = 0x01
const SPIF_SENDCHANGE = 0x02

const REFRESH_PS1 = [
  '$code = @"',
  'using System;',
  'using System.Runtime.InteropServices;',
  'public static class CurRefresh {',
  '  [DllImport("user32.dll", SetLastError = true)]',
  '  public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, IntPtr pvParam, uint fWinIni);',
  '}',
  '"@',
  'Add-Type -TypeDefinition $code',
  '[void][CurRefresh]::SystemParametersInfo(0x0057, 0, [IntPtr]::Zero, 0x03)',
  '',
].join('\n')

async function refreshWindowsCursors(): Promise<{ ok: boolean; message?: string }> {
  const tmpDir = process.env.TEMP ?? process.cwd()
  const scriptPath = join(tmpDir, `dsh-cursor-refresh-${process.pid}.ps1`)
  try {
    // UTF-8 with BOM so Windows PowerShell 5 reads it as UTF-8 reliably.
    const bom = Buffer.from([0xef, 0xbb, 0xbf])
    writeFileSync(scriptPath, Buffer.concat([bom, Buffer.from(REFRESH_PS1, 'utf8')]))
    const r = await exec('powershell.exe', [
      '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath,
    ])
    if (r.code !== 0) {
      return { ok: false, message: `Cursor refresh failed: ${r.stderr || r.stdout}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, message: `Cursor refresh failed: ${e instanceof Error ? e.message : String(e)}` }
  } finally {
    try { rmSync(scriptPath, { force: true }) } catch { /* best-effort cleanup */ }
  }
}

/** Restore Windows system cursors to defaults. */
export async function restoreSystemWindows(): Promise<ApplyResult> {
  const keys = WIN_MAP.map(([, key]) => key)
  for (const key of keys) {
    await exec('reg.exe', ['delete', 'HKCU\\Control Panel\\Cursors', '/v', key, '/f']).catch(() => {})
  }
  await refreshWindowsCursors().catch(() => {})
  return { ok: true, platform: 'win32', written: [], skipped: [] }
}

// ---------- macOS ----------

/** Check macOS accessibility permission (AXIsProcessTrusted via osascript). */
export async function macAccessibilityGranted(): Promise<boolean> {
  try {
    const r = await exec('osascript', [
      '-e', 'use framework "ApplicationServices"', '-e', 'return (AXIsProcessTrusted() as boolean)',
    ])
    return r.code === 0 && /true/i.test(r.stdout)
  } catch {
    return false
  }
}

/** Open macOS System Settings → Privacy & Security → Accessibility. */
export async function macOpenAccessibilitySettings(): Promise<ApplyResult> {
  await exec('open', ['x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility']).catch(() => {})
  return {
    ok: true, platform: 'darwin', written: [], skipped: [],
    message: 'System Settings opened — please enable the accessibility permission for your terminal/DSH Desktop.',
  }
}

/**
 * macOS path — REAL system-cursor application via a compiled Swift helper
 * that uses the private CoreGraphics API (CGSSetGlobalCursorImage, the same
 * approach as Mousecape) plus Accessibility element detection to switch
 * cursor state (pointer/text/not-allowed). Experimental: private API, may
 * break with a future macOS update.
 *
 * Flow:
 *   1. Export each state's PNG into cursorDir (state-name files).
 *   2. Compile assets/mac-cursor-overlay.swift → cursorDir/overlay (swiftc).
 *   3. Spawn it with --dir cursorDir; write the pid to a state file.
 *   4. stopSystemMac kills the process (SIGTERM → helper resets the cursor).
 */

const SWIFT_SOURCE_REL = fileURLToPath(new URL('../assets/mac-cursor-overlay.swift', import.meta.url))
const PID_FILENAME = 'overlay.pid'

/** macOS state names the overlay understands (PNG file base names). */
const MAC_STATES = ['default', 'pointer', 'text', 'wait', 'not-allowed', 'grab']

async function macApply(settings: CursorThemeSettings, cursorDir: string): Promise<ApplyResult> {
  const absDir = resolve(cursorDir)
  mkdirSync(absDir, { recursive: true })

  // 1) Export PNGs per state.
  const written: string[] = []
  const skipped: string[] = []
  for (const stateId of MAC_STATES) {
    const cfg = settings.states?.[stateId]
    if (!cfg?.image) { skipped.push(stateId); continue }
    const pngPath = join(absDir, `${stateId}.png`)
    try {
      const comma = cfg.image.indexOf(',')
      if (!cfg.image.startsWith('data:image/png') || comma < 0) throw new Error('not a PNG data URL')
      writeFileSync(pngPath, Buffer.from(cfg.image.slice(comma + 1), 'base64'))
      written.push(stateId)
    } catch { skipped.push(stateId) }
  }
  if (written.length === 0) {
    return { ok: false, platform: 'darwin', written, skipped, message: 'No PNG states to apply on macOS' }
  }

  // 2) Compile the Swift helper (needs Xcode CLT; macOS ships swiftc).
  const binaryPath = join(absDir, 'overlay')
  if (!existsSync(SWIFT_SOURCE_REL)) {
    return { ok: false, platform: 'darwin', written, skipped, message: 'macOS overlay source missing from package' }
  }
  const swiftSrc = readFileSync(SWIFT_SOURCE_REL, 'utf8')
  writeFileSync(join(absDir, 'overlay.swift'), swiftSrc)
  const compiled = await exec('swiftc', ['-O', join(absDir, 'overlay.swift'), '-o', binaryPath])
  if (compiled.code !== 0) {
    return { ok: false, platform: 'darwin', written, skipped, message: `swiftc failed: ${compiled.stderr || compiled.stdout}` }
  }

  // 3) Stop any previous instance, then spawn.
  await macStop(absDir)
  const child = await spawnDetached(binaryPath, ['--dir', absDir])
  if (child.code !== 0) {
    return { ok: false, platform: 'darwin', written, skipped, message: `overlay failed to start: ${child.stderr || child.stdout}` }
  }
  writeFileSync(join(absDir, PID_FILENAME), String(child.pid))
  return { ok: true, platform: 'darwin', written, skipped, message: 'Applied system cursors (experimental, private API).' }
}

/** Stop a running macOS overlay (SIGTERM → helper resets cursor). */
export async function macStop(cursorDir: string): Promise<ApplyResult> {
  const pidFile = join(resolve(cursorDir), PID_FILENAME)
  if (existsSync(pidFile)) {
    const pid = Number(readFileSync(pidFile, 'utf8').trim())
    if (Number.isInteger(pid) && pid > 0) {
      await exec('kill', ['-TERM', String(pid)]).catch(() => {})
      // Give it a moment, then force-kill if needed.
      await new Promise((r) => setTimeout(r, 300))
      await exec('kill', ['-KILL', String(pid)]).catch(() => {})
    }
    rmSync(pidFile, { force: true })
  }
  return { ok: true, platform: 'darwin', written: [], skipped: [] }
}

/** Whether a macOS overlay is currently running. */
export async function macOverlayRunning(cursorDir: string): Promise<boolean> {
  const pidFile = join(resolve(cursorDir), PID_FILENAME)
  if (!existsSync(pidFile)) return false
  const pid = Number(readFileSync(pidFile, 'utf8').trim())
  if (!Number.isInteger(pid) || pid <= 0) return false
  const r = await exec('ps', ['-p', String(pid), '-o', 'comm='])
  return r.code === 0 && r.stdout.trim().length > 0
}

/** Spawn a detached process and resolve with its pid or the error text. */
function spawnDetached(cmd: string, args: string[]): Promise<{ code: number; pid: number; stderr: string; stdout: string }> {
  return new Promise((resolve) => {
    const child = execFile(cmd, args, { windowsHide: true }, (error, stdout, stderr) => {
      // On success this callback fires only when the process EXITS; for a
      // long-running overlay we resolve on 'spawn' instead (handled below).
      void error; void stdout; void stderr
    })
    child.once('spawn', () => resolve({ code: 0, pid: child.pid ?? 0, stderr: '', stdout: '' }))
    child.once('error', (e) => resolve({ code: 1, pid: 0, stderr: e.message, stdout: '' }))
  })
}

/** Remove an exported cursor folder. */
export function cleanupCursorDir(cursorDir: string): void {
  rmSync(cursorDir, { recursive: true, force: true })
}

// Re-export for the route layer.
export { macApply as applySystemMac }
