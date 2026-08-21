/**
 * dsh-cursor-theme settings section (M2).
 *
 * Rendered in 设置 → 插件 → 光标主题 (settings.section slot). Reads and
 * writes the `dsh-cursor-theme` settings namespace through the settings
 * scope. Every mutation writes the WHOLE `states` object (scope.set uses a
 * single scalar field path, so nested state fields are persisted as one
 * document field — see dsh-client-ui-settings SettingsScopeController.set).
 *
 * Styling is inline on purpose: the client bundle build chain is tsc +
 * banner wrap (no CSS-module pipeline yet). Keeps M2 self-contained.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Input, Modal, Pill } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CursorStateConfig, CursorThemeSettings } from './types.js'
import { CURSOR_STATES } from './states.js'
import { BUILTIN_ASSETS, assetsForState } from './assets.js'
import { BUILTIN_THEMES, resolveThemeStates } from './themes.js'
import { buildThemePack, downloadText, parseThemePack, serializeThemePack } from './pack.js'
import { AiGenerationSection } from './ai-section.js'

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

  const commit = useCallback((next: CursorStateConfig) => {
    setLocal(next)
    const snap = scope.getSnapshot()
    const settings: CursorThemeSettings = snap.status === 'ready' && snap.value
      ? snap.value
      : { enabled: true, followTheme: false, fallback: 'auto', defaultSize: 32, states: {} }
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
    if (file.size > 512 * 1024) {
      setErr('Image must be smaller than 512 KB')
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

  const previewSettings: CursorThemeSettings = { enabled: true, followTheme: false, fallback: 'auto', defaultSize: 32, states: { [stateId]: local } }
  const builtins = assetsForState(stateId)

  return (
    <Modal open onClose={onClose} title={`${t('edit')}: ${stateLabel(t, stateId, stateId)}`}>
      <div style={{ minWidth: 380 }}>
        <div style={modalRow}>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>{t('upload')}</Button>
          <input
            ref={fileRef} type="file" accept=".png,.cur,image/png" style={{ display: 'none' }}
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
          {local.image && <Button variant="outline" size="sm" onClick={onRemove}>{t('removeImage')}</Button>}
        </div>
        <div style={hintStyle}>{t('uploadHint')}</div>
        {err && <div style={{ ...hintStyle, color: '#c0392b' }}>{err}</div>}

        {builtins.length > 0 && (
          <div style={{ margin: '12px 0' }}>
            <div style={hintStyle}>{t('builtin')}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {builtins.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => commit({ ...local, image: a.image, hotspot: a.hotspot, size: a.size })}
                  title={a.name}
                  style={{
                    width: 44, height: 44, borderRadius: 8, border: '1px solid var(--dsw-alias-border-l2, #ddd)',
                    background: 'var(--dsw-alias-bg-module-platform, #fafafa)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <img src={a.image} alt={a.name} style={{ width: 28, height: 28, pointerEvents: 'none' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {local.image && (
          <>
            <div style={modalRow}>
              <span style={{ width: 90 }}>{t('hotspot')}</span>
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
              <span style={{ width: 90 }}>{t('size')}</span>
              {SIZES.map((s) => (
                <Pill key={s} active={local.size === s} onClick={() => commit({ ...local, size: s })} style={{ cursor: 'pointer' }}>
                  {s}
                </Pill>
              ))}
            </div>
            <div style={modalRow}>
              <span style={{ width: 90 }}>{t('preview')}</span>
              <span style={{ ...thumbStyle, cursor: cursorFor(stateId, previewSettings) }}>
                Aa
              </span>
              <span style={{ ...hintStyle, margin: 0 }}>
                {t('fallback')}: <code>{fallbackOf(stateId)}</code>
              </span>
            </div>
            <div style={hintStyle}>{t('previewHint')}</div>
          </>
        )}
      </div>
    </Modal>
  )
}

export interface CursorThemeSectionProps {
  scope: CardScope
  t: (key: string) => string
  /** Optional conversation service for one-click prompt sending (M4). */
  conversation?: { send(text: string): Promise<void> } | null
}

export function CursorThemeSection({ scope, t, conversation }: CursorThemeSectionProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [snap, setSnap] = useState(() => scope.getSnapshot())
  const importRef = useRef<HTMLInputElement>(null)
  const [importErr, setImportErr] = useState<string | null>(null)

  useEffect(() => scope.subscribe(() => setSnap(scope.getSnapshot())), [scope])

  if (snap.status === 'unavailable') {
    return <div style={{ padding: 12, color: '#888' }}>{t('unsupported')}</div>
  }
  const settings: CursorThemeSettings = snap.status === 'ready' && snap.value
    ? snap.value
    : { enabled: true, followTheme: false, fallback: 'auto', defaultSize: 32, states: {} }

  const setEnabled = (v: boolean) => { void scope.set('enabled', v) }
  const setFollowTheme = (v: boolean) => { void scope.set('followTheme', v) }
  const resetAll = () => {
    void scope.set('enabled', true)
    void scope.set('states', {})
  }
  const applyTheme = (themeId: string) => {
    const theme = BUILTIN_THEMES.find((x) => x.id === themeId)
    if (!theme) return
    const states = resolveThemeStates(theme)
    if (!states) return
    void scope.set('enabled', true)
    void scope.set('states', states)
  }
  const exportPack = () => {
    const pack = buildThemePack(settings, 'cursor-theme')
    downloadText(`dsh-cursor-theme-${new Date().toISOString().slice(0, 10)}.json`, serializeThemePack(pack))
  }
  const onImportFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const pack = parseThemePack(String(reader.result))
        void scope.set('enabled', pack.settings.enabled)
        void scope.set('states', pack.settings.states)
        setImportErr(null)
      } catch (e) {
        setImportErr(e instanceof Error ? e.message : String(e))
      }
    }
    reader.readAsText(file)
  }

  const configured = CURSOR_STATES.filter((s) => settings.states?.[s.id]?.image)

  return (
    <div style={{ padding: '4px 16px 24px', maxWidth: 640 }}>
      <div style={hintStyle}>{t('subtitle')}</div>

      <div style={rowStyle}>
        <span style={labelStyle}>{t('enabled')}</span>
        <Button variant={settings.enabled ? 'primary' : 'outline'} size="sm" onClick={() => setEnabled(!settings.enabled)}>
          {settings.enabled ? 'ON' : 'OFF'}
        </Button>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>{t('followTheme')}</span>
        <Button variant={settings.followTheme ? 'primary' : 'outline'} size="sm" onClick={() => setFollowTheme(!settings.followTheme)}>
          {settings.followTheme ? 'ON' : 'OFF'}
        </Button>
      </div>

      <div style={{ marginTop: 12, fontWeight: 600, fontSize: 14 }}>{t('themes')}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {BUILTIN_THEMES.map((th) => (
          <Pill key={th.id} onClick={() => applyTheme(th.id)} title={th.description} style={{ cursor: 'pointer' }}>
            {th.name}
          </Pill>
        ))}
      </div>

      <div style={{ ...rowStyle, borderBottom: 'none' }}>
        <span style={labelStyle}>{t('resetAll')}</span>
        <Button variant="outline" size="sm" onClick={resetAll}>{t('resetAll')}</Button>
      </div>

      <div style={{ ...rowStyle, borderBottom: 'none' }}>
        <span style={labelStyle}>{t('exportImport')}</span>
        <Button variant="outline" size="sm" onClick={exportPack}>{t('export')}</Button>
        <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>{t('import')}</Button>
        <input
          ref={importRef} type="file" accept=".json,application/json" style={{ display: 'none' }}
          onChange={(e) => onImportFile(e.target.files?.[0])}
        />
      </div>
      {importErr && <div style={{ ...hintStyle, color: '#c0392b' }}>{t('importFailed')}: {importErr}</div>}

      <div style={hintStyle}>{t('a11yNote')}</div>

      <AiGenerationSection scope={scope} t={t} conversation={conversation ?? null} />

      <div style={{ marginTop: 16, fontWeight: 600, fontSize: 14 }}>{t('states')}</div>
      {CURSOR_STATES.map((def) => {
        const cfg = settings.states?.[def.id]
        return (
          <div key={def.id} style={rowStyle}>
            <div style={thumbStyle}>
              <span style={{ cursor: cursorFor(def.id, settings), fontSize: 16 }}>⌖</span>
            </div>
            <span style={labelStyle}>{stateLabel(t, def.id, def.label)}</span>
            {cfg?.image && <Pill active>✓</Pill>}
            <Button variant="outline" size="sm" onClick={() => setEditing(def.id)}>{t('edit')}</Button>
          </div>
        )
      })}

      {configured.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{t('preview')}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {configured.map((def) => (
              <div key={def.id} style={{ cursor: cursorFor(def.id, settings), ...previewCellStyle }}>
                {stateLabel(t, def.id, def.id)}
              </div>
            ))}
          </div>
          <div style={hintStyle}>{t('previewHint')}</div>
        </div>
      )}

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

const previewCellStyle: React.CSSProperties = {
  width: 64, height: 56, display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: 4, border: '1px solid var(--dsw-alias-border-l2, #eee)',
  borderRadius: 8, fontSize: 11, color: 'var(--dsw-alias-label-secondary, #666)',
}
