/**
 * dsh-cursor-theme host entry — aligned with deepseek-harness-desktop
 * plugin conventions (see dsh-community-market's host entry).
 *
 * - Registers the persisted settings namespace (`dsh-cursor-theme`) with the
 *   host settings service.
 * - Mounts webServer routes for SYSTEM-LEVEL cursor application:
 *     GET  /dsh-cursor-theme/system/status        → platform + macOS AX status
 *     POST /dsh-cursor-theme/system/apply          → apply to OS (body: settings)
 *     POST /dsh-cursor-theme/system/restore        → restore OS defaults
 *     POST /dsh-cursor-theme/system/mac/settings   → open macOS Accessibility settings
 *   Windows is fully supported (registry + SPI_SETCURSORS); macOS is
 *   permission-guidance + export (no native API — documented honestly).
 *
 * Desktop-aligned wiring: module-level inject, no lifecycle scripts, no
 * GitHub install target, rc.7-compatible peers, dsh.bundle.patch present.
 */

import type { Context } from '@deepseek-ai/cordis'
import { join } from 'node:path'
import { installCursorThemeSettings, type CursorThemeSettings } from './schema.js'
import {
  applySystemWindows, restoreSystemWindows, macAccessibilityGranted,
  macOpenAccessibilitySettings, exportSystemMac, currentPlatform, type ApplyResult,
} from './system.js'

export const name = 'dsh-cursor-theme'

/**
 * Host services this plugin requires at mount. `settings` is guaranteed;
 * `webServer` is provided on web/desktop compositions (routes become inert
 * without it).
 */
export const inject: string[] = ['settings', 'webServer']

/** Root path for our system-cursor HTTP API. */
const API_ROOT = '/dsh-cursor-theme/system'

export function apply(ctx: Context, config?: Partial<CursorThemeSettings>): void {
  const entry: CursorThemeSettings = {
    enabled: config?.enabled ?? true,
    fallback: config?.fallback ?? 'auto',
    defaultSize: config?.defaultSize ?? 32,
    states: config?.states ?? {},
  }
  installCursorThemeSettings(ctx, entry)

  ctx.inject(['webServer'], (hostCtx) => {
    const host = hostCtx as unknown as {
      router: {
        get(path: string, handler: (req: unknown, res: unknown) => void): void
        post(path: string, handler: (req: unknown, res: unknown) => void): void
      }
    }
    if (!host?.router) return

    const cursorDir = join(process.cwd(), '.dsh-cursor-theme', 'system')

    host.router.get(`${API_ROOT}/status`, async (_req, res) => {
      const platform = currentPlatform()
      const accessibilityGranted = platform === 'darwin' ? await macAccessibilityGranted() : undefined
      json(res, { ok: true, platform, accessibilityGranted })
    })

    host.router.post(`${API_ROOT}/apply`, async (req, res) => {
      const settings = (req as { body?: CursorThemeSettings }).body
      if (!settings || typeof settings !== 'object') {
        json(res, { ok: false, message: 'Missing settings body' }, 400)
        return
      }
      const platform = currentPlatform()
      let result: ApplyResult
      if (platform === 'win32') {
        result = await applySystemWindows(settings, cursorDir)
      } else if (platform === 'darwin') {
        result = await exportSystemMac(settings, cursorDir)
      } else {
        json(res, { ok: false, message: `System cursors unsupported on ${platform}` }, 400)
        return
      }
      json(res, result, result.ok ? 200 : 500)
    })

    host.router.post(`${API_ROOT}/restore`, async (_req, res) => {
      const platform = currentPlatform()
      const result = platform === 'win32'
        ? await restoreSystemWindows()
        : { ok: true, platform, written: [] as string[], skipped: [] as string[] }
      json(res, result)
    })

    host.router.post(`${API_ROOT}/mac/settings`, async (_req, res) => {
      const result = await macOpenAccessibilitySettings()
      json(res, result)
    })
  })

  ctx.logger?.info?.('[dsh-cursor-theme] host entry loaded (settings + system routes)')
}

function json(res: unknown, body: unknown, status = 200): void {
  const r = res as { statusCode?: number; setHeader?: (k: string, v: string) => void; end?: (s: string) => void }
  try {
    r.statusCode = status
    r.setHeader?.('Content-Type', 'application/json')
    r.end?.(JSON.stringify(body))
  } catch {
    // router may expose a different API; best-effort
    void r
  }
}
