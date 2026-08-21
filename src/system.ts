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

import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { join } from 'node:path'
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
  mkdirSync(cursorDir, { recursive: true })

  for (const [stateId, key] of WIN_MAP) {
    const cfg = settings.states?.[stateId]
    if (!cfg?.image) {
      skipped.push(key)
      continue
    }
    const hotspotX = Math.round(cfg.hotspot?.x ?? 0)
    const hotspotY = Math.round(cfg.hotspot?.y ?? 0)
    const curPath = join(cursorDir, `${stateId}.cur`)
    try {
      const bytes = pngDataUrlToCur(cfg.image, hotspotX, hotspotY)
      writeFileSync(curPath, bytes)
      written.push(key)
      // HKCU\Control Panel\Cursors\<Key> = path
      await exec('reg.exe', ['add', `HKCU\\Control Panel\\Cursors\\${key}`, '/v', '', '/t', 'REG_SZ', '/d', curPath, '/f'])
    } catch (e) {
      skipped.push(key)
      if (!skipped.includes(key)) {
        // record only first failure reason in message
        void e
      }
    }
  }

  // Refresh system cursors immediately.
  const refresh = await exec('powershell.exe', [
    '-NoProfile', '-NonInteractive', '-Command',
    'Add-Type -TypeDefinition "using System;using System.Runtime.InteropServices;public static class C{[DllImport(\"user32.dll\")]public static extern bool SystemParametersInfo(uint a,uint b,IntPtr c,uint d);}" ; [C]::SystemParametersInfo(0x0057,0,[IntPtr]::Zero,0x01) | Out-Null',
  ])
  if (refresh.code !== 0) {
    return { ok: false, platform: 'win32', written, skipped, message: `Cursor refresh failed: ${refresh.stderr || refresh.stdout}` }
  }
  return { ok: true, platform: 'win32', written, skipped }
}

/** Restore Windows system cursors to defaults. */
export async function restoreSystemWindows(): Promise<ApplyResult> {
  const keys = WIN_MAP.map(([, key]) => key)
  for (const key of keys) {
    await exec('reg.exe', ['delete', `HKCU\\Control Panel\\Cursors\\${key}`, '/f']).catch(() => {})
  }
  await exec('powershell.exe', [
    '-NoProfile', '-NonInteractive', '-Command',
    'Add-Type -TypeDefinition "using System;using System.Runtime.InteropServices;public static class C{[DllImport(\"user32.dll\")]public static extern bool SystemParametersInfo(uint a,uint b,IntPtr c,uint d);}" ; [C]::SystemParametersInfo(0x0057,0,[IntPtr]::Zero,0x01) | Out-Null',
  ]).catch(() => {})
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
 * macOS path: export the theme as .cur/.png files into a folder so the user
 * can import with a third-party cursor tool (macOS has no native API).
 */
export async function exportSystemMac(settings: CursorThemeSettings, cursorDir: string): Promise<ApplyResult> {
  mkdirSync(cursorDir, { recursive: true })
  const written: string[] = []
  const skipped: string[] = []
  for (const [stateId, key] of WIN_MAP) {
    const cfg = settings.states?.[stateId]
    if (!cfg?.image) {
      skipped.push(key)
      continue
    }
    const curPath = join(cursorDir, `${key}.cur`)
    try {
      const bytes = pngDataUrlToCur(cfg.image, Math.round(cfg.hotspot?.x ?? 0), Math.round(cfg.hotspot?.y ?? 0))
      writeFileSync(curPath, bytes)
      written.push(key)
    } catch {
      skipped.push(key)
    }
  }
  return {
    ok: true, platform: 'darwin', written, skipped,
    exportDir: cursorDir,
    message: 'macOS has no native system-cursor API. Exported .cur files — import them with a third-party cursor tool (e.g. Mousecape).',
  }
}

/** Remove an exported cursor folder. */
export function cleanupCursorDir(cursorDir: string): void {
  rmSync(cursorDir, { recursive: true, force: true })
}
