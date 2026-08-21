/**
 * dsh-cursor-theme system-apply section (client).
 *
 * Talks to the host's webServer routes:
 *   GET  /dsh-cursor-theme/system/status
 *   POST /dsh-cursor-theme/system/apply   (body: current settings)
 *   POST /dsh-cursor-theme/system/restore
 *   POST /dsh-cursor-theme/system/mac/settings
 *
 * Windows: one click applies the current theme system-wide (registry +
 * SPI_SETCURSORS) — visible in Explorer and every app. macOS: guides the
 * user to enable accessibility permission and exports .cur files (no native
 * API — shown honestly).
 */

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CursorThemeSettings } from './types.js'

export interface SystemSectionProps {
  scope: {
    getSnapshot(): { status: 'loading' | 'ready' | 'unavailable'; value: CursorThemeSettings | undefined }
  }
  t: (key: string) => string
}

interface StatusInfo {
  platform: string
  accessibilityGranted?: boolean
}

const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0', flexWrap: 'wrap' }
const hintStyle: React.CSSProperties = { fontSize: 12, color: 'var(--dsw-alias-label-tertiary, #999)', margin: '4px 0 0' }
const panelStyle: React.CSSProperties = {
  marginTop: 20, padding: '12px 0', borderTop: '1px solid var(--dsw-alias-border-l2, #eee)',
}

async function api(path: string, body?: unknown): Promise<{ ok: boolean; [k: string]: unknown }> {
  const res = await fetch(path, body === undefined
    ? undefined
    : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, ...data }
}

export function SystemSection({ scope, t }: SystemSectionProps) {
  const [status, setStatus] = useState<StatusInfo | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const r = await api('/dsh-cursor-theme/system/status')
        setStatus({ platform: String(r.platform ?? ''), accessibilityGranted: r.accessibilityGranted as boolean | undefined })
      } catch {
        setStatus({ platform: 'unknown' })
      }
    })()
  }, [])

  const applyToSystem = useCallback(async () => {
    const snap = scope.getSnapshot()
    const settings: CursorThemeSettings = snap.status === 'ready' && snap.value
      ? snap.value
      : { enabled: true, fallback: 'auto', defaultSize: 32, states: {} }
    if (!settings.enabled || Object.keys(settings.states).length === 0) {
      setErr(t('sysEmpty'))
      return
    }
    setBusy(true); setErr(null); setMsg(null)
    try {
      const r = await api('/dsh-cursor-theme/system/apply', settings)
      if (r.ok) {
        setMsg(`${t('sysApplied')}: ${(r.written as string[] | undefined)?.join(', ') ?? ''}`)
      } else {
        setErr(String(r.message ?? t('sysFailed')))
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [scope, t])

  const restoreSystem = useCallback(async () => {
    setBusy(true); setErr(null); setMsg(null)
    try {
      const r = await api('/dsh-cursor-theme/system/restore')
      if (r.ok) setMsg(t('sysRestored'))
      else setErr(String(r.message ?? t('sysFailed')))
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [t])

  const openMacSettings = useCallback(async () => {
    await api('/dsh-cursor-theme/system/mac/settings')
  }, [])

  const isMac = status?.platform === 'darwin'
  const isWin = status?.platform === 'win32'

  return (
    <div style={panelStyle}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('sysTitle')}</div>
      <div style={hintStyle}>{isWin ? t('sysWinHint') : isMac ? t('sysMacHint') : t('sysUnsupported')}</div>

      <div style={rowStyle}>
        <Button variant="primary" size="sm" onClick={applyToSystem} disabled={busy || (!isWin && !isMac)}>
          {busy ? t('sysWorking') : t('sysApply')}
        </Button>
        <Button variant="outline" size="sm" onClick={restoreSystem} disabled={busy || !isWin}>
          {t('sysRestore')}
        </Button>
        {isMac && (
          <Button variant="outline" size="sm" onClick={openMacSettings} disabled={busy}>
            {t('sysMacOpenSettings')}
          </Button>
        )}
      </div>

      {isMac && (
        <div style={hintStyle}>
          {status?.accessibilityGranted
            ? `✓ ${t('sysMacGranted')}`
            : t('sysMacUngranted')}
        </div>
      )}

      {msg && <div style={{ ...hintStyle, color: 'var(--dsw-static-neutral-bluish-400, #4a7)', marginTop: 8 }}>{msg}</div>}
      {err && <div style={{ ...hintStyle, color: '#c0392b', marginTop: 8 }}>{err}</div>}
    </div>
  )
}
