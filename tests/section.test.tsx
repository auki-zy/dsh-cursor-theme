/**
 * CursorThemeSection render tests (jsdom). Primitives are mocked to keep the
 * unit boundary tight (the host injects its own bundled primitives).
 */
// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, act, cleanup, fireEvent, waitFor } from '@testing-library/react'
import JSZip from 'jszip'
import { CursorThemeSection, type CardScope } from '../src/client/section.js'
import type { CursorThemeSettings } from '../src/client/types.js'

const PNG_1x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

// vitest globals are off, so RTL's auto-cleanup never registers; without an
// explicit teardown every render appends another container to document.body
// and stale DOM leaks into later tests (e.g. a leftover 恢复系统默认 button
// that swallows the click).
afterEach(() => cleanup())

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

  it('restore-system-default clears states AND requests a system restore', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    vi.stubGlobal('fetch', fetchMock)
    const setCalls: Array<[string, unknown]> = []
    const scope = makeScope(readySettings)
    scope.set = async (f, v) => { setCalls.push([f, v]) }
    const { container } = render(<CursorThemeSection scope={scope} t={t} />)
    const resetBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'resetAll')
    expect(resetBtn).toBeTruthy()
    await act(async () => { resetBtn!.click() })
    // In-app config is reset…
    expect(setCalls).toContainEqual(['enabled', true])
    expect(setCalls).toContainEqual(['states', {}])
    // …and the OS cursor scheme is reverted through the system route.
    expect(fetchMock).toHaveBeenCalledWith('/dsh-cursor-theme/system/restore', undefined)
    vi.unstubAllGlobals()
  })

  it('shows a failure hint when the system restore fails', async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, json: async () => ({ message: 'boom' }) }))
    vi.stubGlobal('fetch', fetchMock)
    const scope = makeScope(readySettings)
    const { container } = render(<CursorThemeSection scope={scope} t={t} />)
    const resetBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'resetAll')
    expect(resetBtn).toBeTruthy()
    await act(async () => { resetBtn!.click() })
    expect(container.textContent).toContain('resetAllFailed')
    vi.unstubAllGlobals()
  })

  it('replaces the import button with a clickable drag & drop zone', () => {
    const { container } = render(<CursorThemeSection scope={makeScope(readySettings)} t={t} />)
    // No import button anymore…
    expect(Array.from(container.querySelectorAll('button')).some((b) => b.textContent === 'import')).toBe(false)
    // …the zone is a keyboard/clickable element with a hidden file input.
    const zone = container.querySelector('[aria-label="packDropHint"]')
    expect(zone).toBeTruthy()
    const input = container.querySelector('input[type="file"]')
    expect(input).toBeTruthy()
    const clickSpy = vi.fn()
    input!.addEventListener('click', clickSpy)
    act(() => { (zone as HTMLElement).click() })
    expect(clickSpy).toHaveBeenCalled()
  })

  it('imports a dropped file and surfaces the parse error', async () => {
    const { container } = render(<CursorThemeSection scope={makeScope(readySettings)} t={t} />)
    const zone = container.querySelector('[aria-label="packDropHint"]') as HTMLElement
    expect(zone).toBeTruthy()
    const file = new File(['this is definitely not a zip'], 'theme.zip', { type: 'application/zip' })
    await act(async () => {
      fireEvent.drop(zone, { dataTransfer: { files: [file] } })
    })
    await waitFor(() => expect(container.textContent).toContain('importFailed'))
  })

  it('applies a valid imported pack immediately and shows a success hint', async () => {
    const zip = new JSZip()
    zip.file('manifest.json', JSON.stringify({
      schema: 1, name: 't', version: '1.0.0', enabled: true,
      states: { pointer: { file: 'pointer.png' } },
    }))
    const comma = PNG_1x1.indexOf(',')
    zip.file('pointer.png', PNG_1x1.slice(comma + 1), { base64: true })
    const blob = await zip.generateAsync({ type: 'blob' })
    const file = new File([blob], 'theme.zip', { type: 'application/zip' })

    const setCalls: Array<[string, unknown]> = []
    const scope = makeScope(readySettings)
    scope.set = async (f, v) => { setCalls.push([f, v]) }
    const { container } = render(<CursorThemeSection scope={scope} t={t} />)
    const zone = container.querySelector('[aria-label="packDropHint"]') as HTMLElement
    await act(async () => {
      fireEvent.drop(zone, { dataTransfer: { files: [file] } })
    })
    // Import applies the pack to the settings immediately…
    await waitFor(() => {
      expect(setCalls).toContainEqual(['enabled', true])
      expect(setCalls.some(([f]) => f === 'states')).toBe(true)
    })
    // …and confirms it to the user.
    expect(container.textContent).toContain('packImported')
  })
})
