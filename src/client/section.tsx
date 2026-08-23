/**
 * dsh-cursor-theme settings section.
 *
 * Rendered in 设置 → 光标主题 (top-level settings.section slot). Reads and
 * writes the `dsh-cursor-theme` settings namespace through the settings
 * scope. Every mutation writes the WHOLE `states` object (scope.set uses a
 * single scalar field path).
 *
 * UX per user feedback:
 *  - Left thumbnail: the SYSTEM DEFAULT cursor for the state (real PNG
 *    rendered from the default icon SVG) — shows what is being replaced.
 *  - Right side of each row: the FINISHED cursor preview (custom image if
 *    configured, else the system default).
 *  - No separate preview area; no AI generator; no light/dark follow.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Input, Modal, Pill } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CursorStateConfig, CursorThemeSettings } from './types.js'
import { CURSOR_STATES } from './states.js'
import { BUILTIN_THEMES, resolveThemeStates } from './themes.js'
import { renderSvgToDataUrl } from './render.js'
import { downloadImagePack, parseImagePack, MAX_IMAGE_BYTES } from './pack.js'
import { api, SystemSection } from './system-section.js'

/** Structural slice of the settings scope used by this UI. */
export interface CardScope {
  getSnapshot(): {
    status: 'loading' | 'ready' | 'unavailable'
    value: CursorThemeSettings | undefined
    writable: boolean
  }
  subscribe(listener: () => void): () => void
  set(field: string, value: unknown): Promise<void>
  unset(field: string): Promise<void>
}

export interface CursorThemeSectionProps {
  scope: CardScope
  t: (key: string) => string
}

const SIZES = [16, 24, 32, 48] as const

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
  borderBottom: '1px solid var(--dsw-alias-border-l2, #eee)',
}
const labelStyle: React.CSSProperties = { flex: 1, fontSize: 13 }
const thumbStyle: React.CSSProperties = {
  width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: 'var(--dsw-alias-bg-module-platform, #f5f5f5)',
}
const hintStyle: React.CSSProperties = { fontSize: 12, color: 'var(--dsw-alias-label-tertiary, #999)', margin: '4px 0 0' }
const modalRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }

/** The CSS `cursor` value for one state under a settings snapshot. */
export function cursorFor(stateId: string, settings: CursorThemeSettings): string {
  const cfg = settings.states?.[stateId]
  if (!cfg?.image) return 'auto'
  const def = CURSOR_STATES.find((s) => s.id === stateId)
  const fallback = def?.fallback ?? 'auto'
  const hx = cfg.hotspot?.x ?? 0
  const hy = cfg.hotspot?.y ?? 0
  return `url("${cfg.image}") ${hx} ${hy}, ${fallback}`
}

/** Localized label for a state id (falls back to the English def label). */
export function stateLabel(t: (key: string) => string, id: string, defLabel: string): string {
  const key = 'state' + id.charAt(0).toUpperCase() + id.slice(1).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  const localized = t(key)
  return localized === key ? defLabel : localized
}

/** The CSS fallback keyword for a state (from the state table). */
export function fallbackOf(stateId: string): string {
  return CURSOR_STATES.find((s) => s.id === stateId)?.fallback ?? 'auto'
}

/** Render a state's system-default icon SVG into a PNG data URL (cached). */
const defaultIconCache = new Map<string, string>()
async function defaultIconPng(stateId: string): Promise<string | null> {
  const cached = defaultIconCache.get(stateId)
  if (cached) return cached
  const def = CURSOR_STATES.find((s) => s.id === stateId)
  if (!def) return null
  const png = await renderSvgToDataUrl(def.defaultIcon, 32)
  if (png) defaultIconCache.set(stateId, png)
  return png
}

function StateEditor({ stateId, cfg, scope, t, onClose }: {
  stateId: string
  cfg: CursorStateConfig | undefined
  scope: CardScope
  t: (key: string) => string
  onClose: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [local, setLocal] = useState<CursorStateConfig>(cfg ?? {})
  const [err, setErr] = useState<string | null>(null)
  // Natural size of the current image, needed to map click positions to
  // hotspot coordinates (hotspots are relative to the raw image pixels).
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null)

  const commit = useCallback((next: CursorStateConfig) => {
    setLocal(next)
    const snap = scope.getSnapshot()
    const settings: CursorThemeSettings = snap.status === 'ready' && snap.value
      ? snap.value
      : { enabled: true, fallback: 'auto', defaultSize: 32, states: {} }
    void scope.set('states', { ...settings.states, [stateId]: next })
  }, [scope, stateId])

  const onUpload = useCallback((file: File | undefined) => {
    if (!file) return
    const isPng = file.type === 'image/png' || /\.png$/i.test(file.name)
    const isCur = /\.cur$/i.test(file.name)
    if (!isPng && !isCur) {
      setErr('Only PNG or CUR files are supported')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErr(t('uploadTooLarge'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      const img = new Image()
      img.onload = () => {
        if (img.naturalWidth > 128 || img.naturalHeight > 128) {
          setErr('Image must be at most 128×128 px')
          return
        }
        setErr(null)
        commit({ ...local, image: dataUrl })
      }
      img.onerror = () => setErr('Failed to read the image')
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }, [local, commit])

  const onRemove = useCallback(() => {
    commit({ hotspot: local.hotspot, size: local.size })
  }, [local, commit])

  const previewSettings: CursorThemeSettings = { enabled: true, fallback: 'auto', defaultSize: 32, states: { [stateId]: local } }

  return (
    <Modal
      open
      onClose={onClose}
      title={`${t('edit')}: ${stateLabel(t, stateId, stateId)}`}
      closeLabel={t('close')}
      className="dsh-cursor-theme-modal"
    >
      {/* The primitive's Modal ships without CSS (stub), so its <h2> uses
          the browser default with a large margin that pushes the content
          down; one scoped rule keeps the header tight without touching the
          host's overall modal padding. */}
      <style>{`.dsh-cursor-theme-modal h2 { margin: 0; }`}</style>
      <div style={{
        minWidth: 380,
        // The modal body may be taller than the viewport; scroll within it
        // instead of clipping.
        maxHeight: 'calc(100vh - 220px)',
        minHeight: 0,
        overflowY: 'auto',
      }}>
        <div style={{ ...modalRow, marginTop: 0 }}>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>{t('upload')}</Button>
          <input
            ref={fileRef} type="file" accept=".png,.cur,image/png" style={{ display: 'none' }}
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
          {local.image && <Button variant="outline" size="sm" onClick={onRemove}>{t('removeImage')}</Button>}
        </div>
        <div style={hintStyle}>{t('uploadHint')}</div>
        {err && <div style={{ ...hintStyle, color: '#c0392b' }}>{err}</div>}

        {local.image && (
          <>
            <div style={modalRow}>
              <span style={{ width: 90, fontSize: 12 }}>{t('hotspot')}</span>
              <Input
                type="number" value={String(local.hotspot?.x ?? 0)}
                onChange={(e) => commit({ ...local, hotspot: { x: Number(e.target.value) || 0, y: local.hotspot?.y ?? 0 } })}
                style={{ width: 72 }}
              />
              <Input
                type="number" value={String(local.hotspot?.y ?? 0)}
                onChange={(e) => commit({ ...local, hotspot: { x: local.hotspot?.x ?? 0, y: Number(e.target.value) || 0 } })}
                style={{ width: 72 }}
              />
            </div>
            <div style={modalRow}>
              <span style={{ width: 90, fontSize: 12 }}>{t('size')}</span>
              {SIZES.map((s) => (
                <Pill key={s} active={local.size === s} onClick={() => commit({ ...local, size: s })} style={{ cursor: 'pointer' }}>
                  {s}
                </Pill>
              ))}
            </div>
            <div style={modalRow}>
              <span style={{ width: 90, fontSize: 12 }}>{t('preview')}</span>
              {/* Clickable hotspot calibrator: click the image where the
                  click point should be; the crosshair marks the current
                  hotspot. Hover shows the resulting cursor. */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  if (!imgDims || rect.width === 0 || rect.height === 0) return
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * imgDims.w)
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * imgDims.h)
                  commit({ ...local, hotspot: { x, y } })
                }}
                style={{
                  position: 'relative', width: 96, height: 96, borderRadius: 8, overflow: 'hidden',
                  border: '1px solid var(--dsw-alias-border-l2, #ddd)',
                  background: 'var(--dsw-alias-bg-module-platform, #f5f5f5)',
                  cursor: cursorFor(stateId, previewSettings),
                  flexShrink: 0,
                }}
              >
                <img
                  src={local.image}
                  alt=""
                  onLoad={(e) => setImgDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                />
                {imgDims && (() => {
                  const hx = (local.hotspot?.x ?? 0) / imgDims.w
                  const hy = (local.hotspot?.y ?? 0) / imgDims.h
                  return (
                    <>
                      <div style={{
                        position: 'absolute', left: `${hx * 100}%`, top: 0, bottom: 0,
                        width: 1, background: 'rgba(231,76,60,0.8)', pointerEvents: 'none',
                      }} />
                      <div style={{
                        position: 'absolute', top: `${hy * 100}%`, left: 0, right: 0,
                        height: 1, background: 'rgba(231,76,60,0.8)', pointerEvents: 'none',
                      }} />
                      <div style={{
                        position: 'absolute', left: `${hx * 100}%`, top: `${hy * 100}%`,
                        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
                        color: '#e74c3c', fontSize: 13, fontWeight: 700, lineHeight: 1,
                        textShadow: '0 0 2px #fff, 0 0 2px #fff',
                      }}>+</div>
                    </>
                  )
                })()}
              </div>
              <div style={{ ...hintStyle, margin: 0, flex: 1 }}>
                {t('fallback')}: <code>{fallbackOf(stateId)}</code>
              </div>
            </div>
            <div style={hintStyle}>{t('hotspotClickHint')}</div>
          </>
        )}
      </div>
    </Modal>
  )
}

export function CursorThemeSection({ scope, t }: CursorThemeSectionProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [snap, setSnap] = useState(() => scope.getSnapshot())
  const importRef = useRef<HTMLInputElement>(null)
  const [importErr, setImportErr] = useState<string | null>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  // Pre-rendered system-default PNGs per state (shown on the left).
  const [defaultPngs, setDefaultPngs] = useState<Record<string, string>>({})
  // 恢复系统默认 also reverts the OS cursor scheme: local feedback + a
  // signal that tells SystemSection to re-query the system status.
  const [resetBusy, setResetBusy] = useState(false)
  const [resetHint, setResetHint] = useState<{ text: string; error: boolean } | null>(null)
  const [sysRefresh, setSysRefresh] = useState(0)

  useEffect(() => scope.subscribe(() => setSnap(scope.getSnapshot())), [scope])

  // Render all system-default icons once.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const out: Record<string, string> = {}
      for (const def of CURSOR_STATES) {
        const png = await defaultIconPng(def.id)
        if (cancelled) return
        if (png) out[def.id] = png
      }
      if (!cancelled) setDefaultPngs(out)
    })()
    return () => { cancelled = true }
  }, [])

  if (snap.status === 'unavailable') {
    return <div style={{ padding: 12, color: '#888' }}>{t('unsupported')}</div>
  }
  const settings: CursorThemeSettings = snap.status === 'ready' && snap.value
    ? snap.value
    : { enabled: true, fallback: 'auto', defaultSize: 32, states: {} }

  const setEnabled = (v: boolean) => { void scope.set('enabled', v) }
  const resetAll = () => {
    // 1) Clear every in-app state override (DSH window back to defaults).
    void scope.set('enabled', true)
    void scope.set('states', {})
    // 2) Also revert the OS cursor scheme (Windows registry restore /
    //    macOS overlay stop) so "restore system default" applies to the
    //    system too, not just inside DSH.
    setResetHint(null)
    setResetBusy(true)
    void (async () => {
      try {
        const r = await api('/dsh-cursor-theme/system/restore')
        setResetHint({ text: r.ok ? t('resetAllApplied') : t('resetAllFailed'), error: !r.ok })
      } catch {
        setResetHint({ text: t('resetAllFailed'), error: true })
      } finally {
        setResetBusy(false)
        setSysRefresh((n) => n + 1)
      }
    })()
  }
  const applyTheme = (themeId: string) => {
    const theme = BUILTIN_THEMES.find((x) => x.id === themeId)
    if (!theme) return
    void (async () => {
      const states = await resolveThemeStates(theme)
      if (!states) return
      await scope.set('enabled', true)
      await scope.set('states', states)
    })()
  }
  const downloadThemeZip = (themeId: string) => {
    const theme = BUILTIN_THEMES.find((x) => x.id === themeId)
    if (!theme) return
    void (async () => {
      const states = await resolveThemeStates(theme)
      if (!states) return
      const settings: CursorThemeSettings = { enabled: true, fallback: 'auto', defaultSize: 32, states }
      await downloadImagePack(settings, `${theme.id}-theme.zip`)
    })()
  }
  const copyAiPrompt = () => {
    void navigator.clipboard?.writeText(t('packAiPrompt')).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }).catch(() => setCopied(false))
  }
  const onImportFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      void (async () => {
        try {
          const result = await parseImagePack(String(reader.result))
          await scope.set('enabled', result.enabled ?? true)
          await scope.set('states', result.states)
          setImportErr(null)
          setImportMsg(result.scaled && result.scaled.length > 0
            ? `${t('packImported')} ${t('packScaled')}: ${result.scaled.join(', ')}`
            : t('packImported'))
        } catch (e) {
          setImportErr(e instanceof Error ? e.message : String(e))
        }
      })()
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ padding: '4px 16px 24px', maxWidth: 640 }}>
      <div style={hintStyle}>{t('subtitle')}</div>

      <div style={rowStyle}>
        <span style={labelStyle}>{t('enabled')}</span>
        <Button variant={settings.enabled ? 'primary' : 'outline'} size="sm" onClick={() => setEnabled(!settings.enabled)}>
          {settings.enabled ? 'ON' : 'OFF'}
        </Button>
      </div>

      <div style={{ marginTop: 12, fontWeight: 600, fontSize: 14 }}>{t('themes')}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
        {BUILTIN_THEMES.map((th) => (
          <span key={th.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Pill
              onClick={() => applyTheme(th.id)}
              title={th.description}
              style={{ cursor: 'pointer' }}
            >
              {th.name}
            </Pill>
            <button
              type="button"
              onClick={() => downloadThemeZip(th.id)}
              title={t('themeDownload')}
              aria-label={t('themeDownload')}
              style={{
                width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
                border: '1px solid var(--dsw-alias-border-l2, #ddd)',
                background: 'var(--dsw-alias-bg-module-platform, #fafafa)',
                color: 'var(--dsw-alias-label-secondary, #555)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, #ececec)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--dsw-alias-bg-module-platform, #fafafa)' }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 2.5 V10.5" />
                <path d="M4.5 7 8 10.5 11.5 7" />
                <path d="M2.5 13.5 H13.5" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <div style={hintStyle}>{t('themeHint')}</div>

      <div style={{ ...rowStyle, borderBottom: 'none' }}>
        <span style={labelStyle}>{t('resetAll')}</span>
        <Button variant="outline" size="sm" onClick={resetAll} disabled={resetBusy}>{t('resetAll')}</Button>
      </div>
      <div style={hintStyle}>{t('resetAllHint')}</div>
      {resetBusy && <div style={hintStyle}>{t('resetAllRestoring')}</div>}
      {resetHint && (
        <div style={{
          fontSize: 12, margin: '4px 0 0',
          color: resetHint.error
            ? '#c0392b'
            : 'var(--dsw-static-neutral-bluish-400, #4a7)',
        }}>{resetHint.text}</div>
      )}

      <div style={{ marginTop: 12, fontWeight: 600, fontSize: 14 }}>{t('exportImport')}</div>
      <div
        role="button"
        tabIndex={0}
        aria-label={t('packDropHint')}
        onClick={() => importRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            importRef.current?.click()
          }
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          onImportFile(e.dataTransfer.files?.[0])
        }}
        style={{
          marginTop: 8, padding: '18px 12px', borderRadius: 10, textAlign: 'center',
          border: `1.5px dashed ${dragOver ? 'var(--dsw-alias-interactive-accent, #5a7dff)' : 'var(--dsw-alias-border-l2, #ccc)'}`,
          background: dragOver
            ? 'var(--dsw-alias-bg-module-platform, #eef2ff)'
            : 'var(--dsw-alias-bg-module-platform, #fafafa)',
          color: 'var(--dsw-alias-label-secondary, #555)',
          cursor: 'pointer', userSelect: 'none',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block', margin: '0 auto 6px' }}>
          <path d="M8 2.5 V10.5" />
          <path d="M4.5 7 8 10.5 11.5 7" />
          <path d="M2.5 13.5 H13.5" />
        </svg>
        <div style={{ fontSize: 13 }}>{t('packDropHint')}</div>
        <div style={{ fontSize: 11, color: 'var(--dsw-alias-label-tertiary, #999)', marginTop: 4 }}>{t('packDropSub')}</div>
        <input
          ref={importRef} type="file" accept=".zip,application/zip" style={{ display: 'none' }}
          onChange={(e) => {
            onImportFile(e.target.files?.[0])
            // Allow re-picking the SAME file after a failed/successful import.
            e.target.value = ''
          }}
        />
      </div>
      {importErr && <div style={{ ...hintStyle, color: '#c0392b' }}>{t('importFailed')}: {importErr}</div>}
      {importMsg && (
        <div style={{
          ...hintStyle,
          color: 'var(--dsw-static-neutral-bluish-400, #4a7)',
        }}>{importMsg}</div>
      )}

      <div style={{ margin: '4px 0 0', fontSize: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--dsw-alias-label-primary, #222)' }}>{t('packHintTitle')}</div>
        <div style={hintStyle}>{t('packHint')}</div>
        <pre style={{
          margin: '8px 0', padding: 10, borderRadius: 8, overflow: 'auto', maxHeight: 150,
          fontSize: 11, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          // Host theme variables (defined for both light & dark): bg-module-platform
          // is the module background, label-primary the main text color. Fixed
          // colors looked out of place; text-primary does not exist in the host.
          background: 'var(--dsw-alias-bg-module-platform, #f5f5f5)',
          color: 'var(--dsw-alias-label-primary, #222)',
          border: '1px solid var(--dsw-alias-border-l2, #ddd)',
        }}>{t('packAiPrompt')}</pre>
        <Button variant="outline" size="sm" onClick={copyAiPrompt}>
          {copied ? t('packCopied') : t('packCopy')}
        </Button>
      </div>

      <SystemSection scope={scope} t={t} refreshSignal={sysRefresh} />

      <div style={{ marginTop: 16, fontWeight: 600, fontSize: 14 }}>{t('states')}</div>
      {CURSOR_STATES.map((def) => {
        const cfg = settings.states?.[def.id]
        const configured = !!cfg?.image
        return (
          <div key={def.id} style={rowStyle}>
            {/* Left: system-default cursor (real PNG) the user is replacing. */}
            <div style={thumbStyle}>
              {defaultPngs[def.id]
                ? <img src={defaultPngs[def.id]} alt={stateLabel(t, def.id, def.label)} style={{ width: 30, height: 30, pointerEvents: 'none' }} />
                : <span style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>…</span>}
            </div>
            <span style={labelStyle}>{stateLabel(t, def.id, def.label)}</span>
            {configured ? <Pill active>✓</Pill> : <Pill>{t('defaultBadge')}</Pill>}
            {/* Right: the FINISHED cursor preview for this state. */}
            <div style={{ ...thumbStyle, width: 40, height: 40, cursor: cursorFor(def.id, settings) }}>
              {cfg?.image && <img src={cfg.image} alt="" style={{ width: 26, height: 26, pointerEvents: 'none' }} />}
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(def.id)}>{t('edit')}</Button>
          </div>
        )
      })}

      {editing && (
        <StateEditor
          stateId={editing}
          cfg={settings.states?.[editing]}
          scope={scope}
          t={t}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
