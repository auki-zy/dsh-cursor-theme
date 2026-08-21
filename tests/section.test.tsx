/**
 * CursorThemeSection render tests (jsdom). Primitives are mocked to keep the
 * unit boundary tight (the host injects its own bundled primitives).
 */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { CursorThemeSection, type CardScope } from '../src/client/section.js'
import type { CursorThemeSettings } from '../src/client/types.js'

// Mock the primitives package so tests don't drag in katex css etc.
vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  Button: (p: Record<string, unknown>) => <button type="button" {...p} />,
  Input: (p: Record<string, unknown>) => <input {...p} />,
  Modal: (p: { open?: boolean; children?: unknown }) => (p.open ? <div data-testid="modal">{p.children}</div> : null),
  Pill: (p: Record<string, unknown>) => <span {...p} />,
}))

const t = (k: string) => k

function makeScope(settings: CursorThemeSettings | undefined, status: 'ready' | 'unavailable' | 'loading' = 'ready'): CardScope {
  return {
    getSnapshot: () => ({ status, value: settings, writable: true }),
    subscribe: () => () => {},
    set: async () => {},
    unset: async () => {},
  }
}

const readySettings: CursorThemeSettings = {
  enabled: true,
  fallback: 'auto',
  defaultSize: 32,
  states: {},
}

describe('CursorThemeSection', () => {
  it('renders content with a ready scope', () => {
    render(<CursorThemeSection scope={makeScope(readySettings)} t={t} />)
    const buttons = Array.from(document.querySelectorAll('button'))
    expect(buttons.length).toBeGreaterThan(10)
  })

  it('does not throw when settings value is undefined', () => {
    expect(() => render(<CursorThemeSection scope={makeScope(undefined, 'ready')} t={t} />)).not.toThrow()
  })

  it('shows the unsupported message when scope is unavailable', () => {
    render(<CursorThemeSection scope={makeScope(undefined, 'unavailable')} t={(k) => k === 'unsupported' ? 'UNSUPPORTED' : k} />)
    expect(document.body.textContent).toContain('UNSUPPORTED')
  })

  it('survives a scope set() call and still renders', async () => {
    let lastSet: [string, unknown] | null = null
    const scope = makeScope(readySettings)
    scope.set = async (f, v) => { lastSet = [f, v] }
    render(<CursorThemeSection scope={scope} t={t} />)
    await act(async () => { await scope.set('enabled', false) })
    expect(lastSet?.[0]).toBe('enabled')
    expect(document.body.textContent.length).toBeGreaterThan(0)
  })
})
