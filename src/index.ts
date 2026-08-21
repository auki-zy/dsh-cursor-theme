/**
 * dsh-cursor-theme host entry — aligned with deepseek-harness-desktop
 * plugin conventions (see dsh-community-market's host entry).
 *
 * - Registers the persisted settings namespace (`dsh-cursor-theme`) with the
 *   host settings service.
 * - Mounts webServer routes for SYSTEM-LEVEL cursor application, using the
 *   SAME contract as the official market: `webServer.register({ kind:
 *   'exact', path, handler })`, loopback-only authority, manual body read.
 *
 *     GET  /dsh-cursor-theme/system/status   → platform + macOS AX/running status
 *     POST /dsh-cursor-theme/system/apply     → apply to OS (body: settings)
 *     POST /dsh-cursor-theme/system/restore   → restore OS defaults (Windows) / stop overlay (macOS)
 *     POST /dsh-cursor-theme/system/mac/settings → open macOS Accessibility
 *
 *   Windows is fully supported (registry + SPI_SETCURSORS); macOS uses a
 *   compiled Swift overlay with the private CoreGraphics API (Mousecape
 *   approach) + Accessibility — experimental, documented honestly.
 */

import type { Context } from '@deepseek-ai/cordis'
import { isIP } from 'node:net'
import { BlockList } from 'node:net'
import { join } from 'node:path'
import { installCursorThemeSettings, type CursorThemeSettings } from './schema.js'
import {
  applySystemWindows, restoreSystemWindows, macAccessibilityGranted,
  macOpenAccessibilitySettings, applySystemMac, macStop, macOverlayRunning,
  currentPlatform, type ApplyResult,
} from './system.js'

export const name = 'dsh-cursor-theme'

/** Host services this plugin requires at mount. */
export const inject: string[] = ['settings', 'webServer']

/** Root path for our system-cursor HTTP API. */
const API_ROOT = '/dsh-cursor-theme/system'
const MAX_BODY_BYTES = 64 * 1024

const LOOPBACK = new BlockList()
LOOPBACK.addSubnet('127.0.0.0', 8, 'ipv4')
LOOPBACK.addSubnet('::1', 128, 'ipv6')

/** Minimal structural face of the webServer service we touch. */
interface WebServerLike {
  register(options: {
    kind: 'exact'
    path: string
    handler: (req: NodeHttpRequestLike, res: NodeHttpResponseLike) => void
  }): unknown
  port?: number
}

interface NodeHttpRequestLike {
  method?: string
  url?: string
  socket?: { remoteAddress?: string }
  headers?: Record<string, string | string[] | undefined>
  on(event: 'data' | 'end' | 'error' | 'aborted', cb: (...args: unknown[]) => void): void
  once?(event: 'data' | 'end' | 'error' | 'aborted', cb: (...args: unknown[]) => void): void
  off?(event: string, cb: (...args: unknown[]) => void): void
  destroy?(cause?: unknown): void
}
interface NodeHttpResponseLike {
  statusCode?: number
  destroyed?: boolean
  setHeader(k: string, v: string): void
  end(body: string): void
}

function sendJson(res: NodeHttpResponseLike, status: number, value: unknown): void {
  if (res.destroyed) return
  const body = JSON.stringify(value)
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(body)
}

/**
 * Only accept loopback requests whose Host header targets 127.0.0.1:port —
 * the exact market authority rule (avoids the earlier bug where the URL-port
 * check rejected every request).
 */
function requestAllowed(req: NodeHttpRequestLike, expectedPort: number | undefined): boolean {
  if (expectedPort === undefined) return false
  const remote = req.socket?.remoteAddress
  if (remote === undefined) return false
  const address = (remote.replace(/^\[|\]$/gu, '').split('%', 1)[0] ?? '').trim()
  const family = isIP(address)
  if (family === 0) return false
  const familyName: 'ipv4' | 'ipv6' = family === 4 ? 'ipv4' : 'ipv6'
  if (!LOOPBACK.check(address, familyName)) return false
  const hostHeader = req.headers?.host
  if (typeof hostHeader !== 'string') return false
  let authority: URL
  try {
    authority = new URL(`http://${hostHeader}`)
  } catch {
    return false
  }
  return authority.protocol === 'http:'
    && Number(authority.port || '80') === expectedPort
    && authority.hostname === '127.0.0.1'
}

/** Read and JSON.parse a request body with a size cap (market pattern). */
function readJsonBody(req: NodeHttpRequestLike): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    const onData = (chunk: unknown) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
      size += buf.length
      if (size > MAX_BODY_BYTES) {
        req.destroy?.(new Error('body too large'))
        reject(new Error('body too large'))
        return
      }
      chunks.push(buf)
    }
    const onEnd = () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new Error('invalid json'))
      }
    }
    req.on('data', onData)
    req.once?.('end', onEnd)
    req.once?.('error', (e) => reject(e))
  })
}

export function apply(ctx: Context, config?: Partial<CursorThemeSettings>): void {
  const entry: CursorThemeSettings = {
    enabled: config?.enabled ?? true,
    fallback: config?.fallback ?? 'auto',
    defaultSize: config?.defaultSize ?? 32,
    states: config?.states ?? {},
  }
  installCursorThemeSettings(ctx, entry)

  // Module-level inject provides ctx.webServer directly (official pattern);
  // mount routes inside an effect so they live as long as the fiber.
  const ws = (ctx as unknown as { webServer?: WebServerLike }).webServer
  if (ws?.register) {
    // Read the listening port lazily at request time (it may not be set yet
    // when apply() runs; official market reads it inside the handler too).
    const cursorDir = join(process.cwd(), '.dsh-cursor-theme', 'system')
    const expectedPort = () => ws.port

    ctx.effect(() => {
      const disposers = [
        ws.register({
          kind: 'exact',
          path: `${API_ROOT}/status`,
          handler: async (req, res) => {
            if (!requestAllowed(req, expectedPort())) return sendJson(res, 403, { ok: false, message: 'authority rejected' })
            const platform = currentPlatform()
            const accessibilityGranted = platform === 'darwin' ? await macAccessibilityGranted() : undefined
            const overlayRunning = platform === 'darwin' ? await macOverlayRunning(cursorDir) : undefined
            sendJson(res, 200, { ok: true, platform, accessibilityGranted, overlayRunning })
          },
        }),
        ws.register({
          kind: 'exact',
          path: `${API_ROOT}/apply`,
          handler: async (req, res) => {
            if (!requestAllowed(req, expectedPort())) return sendJson(res, 403, { ok: false, message: 'authority rejected' })
            if (req.method !== 'POST') return sendJson(res, 405, { ok: false, message: 'requires POST' })
            let settings: CursorThemeSettings | undefined
            try {
              settings = await readJsonBody(req) as CursorThemeSettings
            } catch {
              return sendJson(res, 400, { ok: false, message: 'invalid json body' })
            }
            if (!settings || typeof settings !== 'object') {
              return sendJson(res, 400, { ok: false, message: 'missing settings body' })
            }
            const platform = currentPlatform()
            let result: ApplyResult
            if (platform === 'win32') {
              result = await applySystemWindows(settings, cursorDir)
            } else if (platform === 'darwin') {
              result = await applySystemMac(settings, cursorDir)
            } else {
              return sendJson(res, 400, { ok: false, message: `System cursors unsupported on ${platform}` })
            }
            sendJson(res, result.ok ? 200 : 500, result)
          },
        }),
        ws.register({
          kind: 'exact',
          path: `${API_ROOT}/restore`,
          handler: async (req, res) => {
            if (!requestAllowed(req, expectedPort())) return sendJson(res, 403, { ok: false, message: 'authority rejected' })
            const platform = currentPlatform()
            const result = platform === 'win32'
              ? await restoreSystemWindows()
              : platform === 'darwin'
                ? await macStop(cursorDir)
                : { ok: true, platform, written: [] as string[], skipped: [] as string[] }
            sendJson(res, 200, result)
          },
        }),
        ws.register({
          kind: 'exact',
          path: `${API_ROOT}/mac/settings`,
          handler: async (req, res) => {
            if (!requestAllowed(req, expectedPort())) return sendJson(res, 403, { ok: false, message: 'authority rejected' })
            const result = await macOpenAccessibilitySettings()
            sendJson(res, 200, result)
          },
        }),
      ]
      return () => { for (const d of disposers) (d as () => void)?.() }
    }, 'dsh-cursor-theme: system routes')
  }

  ctx.logger?.info?.('[dsh-cursor-theme] host entry loaded (settings + system routes)')
}
