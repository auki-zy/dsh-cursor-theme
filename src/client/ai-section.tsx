/**
 * dsh-cursor-theme AI generation section (M4).
 *
 * Workflow:
 *   1. User types a theme idea (e.g. "coral cat girl meme").
 *   2. [Generate prompt] builds a structured prompt (ai.ts) that asks the
 *      DSH assistant to reply with a JSON theme.
 *   3. [Copy] copies the prompt to the clipboard.
 *   4. [Send to session] sends it straight into the current conversation
 *      via the `conversation` service (one-click, no manual paste).
 *   5. When the assistant replies with JSON, the user pastes it here and
 *      [Import] validates it (ai.ts) and renders each state through the
 *      shared shape library (render.ts) into ready-to-use data URLs, then
 *      writes the settings.
 */

import { useCallback, useState } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CardScope } from './section.js'
import { buildAiPrompt, parseGeneratedTheme } from './ai.js'
import { renderShapeToDataUrl } from './render.js'
import { SHAPE_BY_ID } from './shapes.js'
import { CURSOR_STATES } from './states.js'
import type { CursorStateConfig, CursorThemeSettings } from './types.js'

export interface AiSectionProps {
  scope: CardScope
  t: (key: string) => string
  conversation?: {
    send(text: string): Promise<void>
  } | null
}

const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }
const hintStyle: React.CSSProperties = { fontSize: 12, color: 'var(--dsw-alias-label-tertiary, #999)', margin: '4px 0 0' }
const textAreaStyle: React.CSSProperties = {
  width: '100%', minHeight: 90, boxSizing: 'border-box', padding: 8,
  borderRadius: 8, border: '1px solid var(--dsw-alias-border-l2, #ddd)',
  fontFamily: 'monospace', fontSize: 12, background: 'var(--dsw-alias-bg-module-platform, #fafafa)',
  color: 'inherit',
}

export function AiGenerationSection({ scope, t, conversation }: AiSectionProps) {
  const [idea, setIdea] = useState('')
  const [prompt, setPrompt] = useState('')
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const copy = useCallback((text: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setError(t('clipboardUnavailable'))
      return
    }
    void navigator.clipboard.writeText(text).then(
      () => { setStatus(t('copied')); setError(null) },
      () => setError(t('clipboardFailed')),
    )
  }, [t])

  const sendToSession = useCallback(() => {
    if (!conversation) {
      setError(t('conversationUnavailable'))
      return
    }
    void conversation.send(prompt).then(
      () => { setStatus(t('sent')); setError(null) },
      () => setError(t('sendFailed')),
    )
  }, [conversation, prompt, t])

  const onGenerate = useCallback(() => {
    setPrompt(buildAiPrompt(idea))
    setStatus(null)
    setError(null)
  }, [idea])

  const onImport = useCallback(() => {
    try {
      const theme = parseGeneratedTheme(reply)
      // Render every state through the shape library.
      const states: Record<string, CursorStateConfig> = {}
      for (const [stateId, gs] of Object.entries(theme.states)) {
        const shape = SHAPE_BY_ID.get(gs.shape)
        if (!shape) continue
        const image = renderShapeToDataUrl(shape, gs.color)
        if (!image) throw new Error('Canvas unavailable in this browser.')
        states[stateId] = { image, hotspot: shape.hotspot, size: 32 }
      }
      const snap = scope.getSnapshot()
      const settings: CursorThemeSettings = snap.status === 'ready' && snap.value
        ? snap.value
        : { enabled: true, followTheme: false, fallback: 'auto', defaultSize: 32, states: {} }
      void scope.set('enabled', true)
      void scope.set('states', states)
      setStatus(`${t('imported')}: ${theme.name}`)
      setError(null)
      setReply('')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [reply, scope, t])

  return (
    <div style={{ marginTop: 20, padding: '12px 0', borderTop: '1px solid var(--dsw-alias-border-l2, #eee)' }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{t('aiTitle')}</div>
      <div style={hintStyle}>{t('aiSubtitle')}</div>

      <div style={rowStyle}>
        <Input
          type="text"
          value={idea}
          placeholder={t('aiPlaceholder')}
          onChange={(e) => setIdea(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button variant="primary" size="sm" onClick={onGenerate} disabled={!idea.trim()}>{t('aiGenerate')}</Button>
      </div>

      {prompt && (
        <>
          <textarea
            readOnly
            value={prompt}
            style={textAreaStyle}
            onFocus={(e) => e.target.select()}
          />
          <div style={rowStyle}>
            <Button variant="outline" size="sm" onClick={() => copy(prompt)}>{t('aiCopy')}</Button>
            <Button variant="outline" size="sm" onClick={sendToSession} disabled={!conversation}>{t('aiSend')}</Button>
          </div>
        </>
      )}

      <div style={{ marginTop: 12 }}>
        <div style={hintStyle}>{t('aiPasteHint')}</div>
        <textarea
          value={reply}
          placeholder={t('aiPastePlaceholder')}
          onChange={(e) => setReply(e.target.value)}
          style={{ ...textAreaStyle, minHeight: 70 }}
        />
        <div style={rowStyle}>
          <Button variant="primary" size="sm" onClick={onImport} disabled={!reply.trim()}>{t('aiImport')}</Button>
        </div>
      </div>

      {status && <div style={{ ...hintStyle, color: 'var(--dsw-static-neutral-bluish-400, #4a7)', marginTop: 8 }}>{status}</div>}
      {error && <div style={{ ...hintStyle, color: '#c0392b', marginTop: 8 }}>{error}</div>}
    </div>
  )
}

/** List of state ids the prompt asks for — reused by the section header. */
export const AI_STATE_IDS = CURSOR_STATES.map((s) => s.id)
