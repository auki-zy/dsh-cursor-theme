/**
 * Client bundle integration test — executes the REAL built client.js through
 * a simulated host __ModuleLoader__ (jsdom), then renders the registered
 * settings.plugins.tab component. Reproduces the exact host load path
 * (esbuild CJS + module shim + external require of primitives/react).
 */
// @vitest-environment jsdom
import { describe, expect, it, beforeAll } from 'vitest'
import { render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as React from 'react'
import { createRequire } from 'node:module'

const requireNode = createRequire(import.meta.url)
const jsxRuntime = requireNode('react/jsx-runtime')

describe('built client bundle under host loader', () => {
  let registered: { options: Record<string, unknown>; component: unknown } | null = null
  let styleTag: HTMLStyleElement | null = null
  let errors: Error[] = []

  beforeAll(() => {
    // Stub the host-injected modules (external requires in the bundle).
    const hostModules: Record<string, unknown> = {
      'react': React,
      'react/jsx-runtime': jsxRuntime,
      '@deepseek-ai/dsh-client-ui-primitives': {
        Button: (p: Record<string, unknown>) => React.createElement('button', { type: 'button', ...p }),
        Input: (p: Record<string, unknown>) => React.createElement('input', { ...p }),
        Modal: (p: { open?: boolean; children?: unknown }) => p.open ? React.createElement('div', null, p.children) : null,
        Pill: (p: Record<string, unknown>) => React.createElement('span', { ...p }),
      },
    }

    // Client-side cordis context stub.
    const effectFns: Array<() => unknown> = []
    const injectHandlers = new Map<string, (scoped: unknown) => void>()
    let makeScope: () => unknown
    const ctx: Record<string, unknown> = {
      effect: (fn: () => unknown) => { effectFns.push(fn); return () => {} },
      on: () => () => {},
      inject: (services: string[], fn: (s: unknown) => void) => { injectHandlers.set(services.join(','), fn) },
      locale: { register: () => {}, bind: () => (k: string) => k },
      slots: {
        inject: (_slot: string, reg: () => unknown) => { const r = reg() as never; if (r && (r as { name?: string }).name === 'settings.section') registered = r as never },
        register: (options: Record<string, unknown>, component: unknown) => ({ name: options.name, options, component }),
      },
    }

    makeScope = () => {
      const snap = { status: 'ready', value: { enabled: true, fallback: 'auto', defaultSize: 32, states: {} }, writable: true }
      return {
        getSnapshot: () => snap,
        subscribe: () => () => {},
        set: async () => {},
        unset: async () => {},
      }
    }
    injectHandlers.set('settingsScope', (scoped) => {
      ;(scoped as { settingsScope: { bind: () => unknown } }).settingsScope = { bind: () => makeScope() }
    })
    injectHandlers.set('theme', (scoped) => {
      ;(scoped as { theme: { getTheme: () => { active: { colorScheme: string } } } }).theme = { getTheme: () => ({ active: { colorScheme: 'light' } }) }
    })
    injectHandlers.set('conversation', (scoped) => {
      ;(scoped as { conversation: { send: () => Promise<void> } }).conversation = { send: async () => {} }
    })
    const runInject = (services: string[], scoped: unknown) => {
      const fn = injectHandlers.get(services.join(','))
      if (fn) fn(scoped)
    }

    // Execute the WHOLE bundle file: banner calls window.__ModuleLoader__.load.
    const code = readFileSync(join(process.cwd(), 'client', 'client.js'), 'utf8')
    let bundleExports: { apply?: (c: unknown) => void; inject?: string[]; name?: string }
    ;(globalThis as Record<string, unknown>).window = globalThis
    ;(globalThis as Record<string, unknown>).__ModuleLoader__ = {
      load: (spec: { id: string; factory: (r: (id: string) => unknown) => { apply: (c: unknown) => void; inject: string[]; name: string } }) => {
        try {
          bundleExports = spec.factory((id: string) => {
            if (!(id in hostModules)) throw new Error(`MODULE_NOT_PROVIDED: ${id}`)
            return hostModules[id]
          })
        } catch (e) {
          errors.push(e as Error)
        }
      },
    }
    const vm = requireNode('node:vm')
    vm.runInThisContext(code, { filename: 'client.js' })

    // Run apply with the stub ctx.
    try {
      bundleExports!.apply!(ctx)
    } catch (e) {
      errors.push(e as Error)
    }
    for (const fn of effectFns) { try { fn() } catch (e) { errors.push(e as Error) } }
    runInject(['settingsScope'], { settingsScope: { bind: () => makeScope() } })
    runInject(['theme'], { theme: { getTheme: () => ({ active: { colorScheme: 'light' } }) } })
    // The tab registration now sits inside conversation inject; simulate the
    // host wiring order: settingsScope → conversation → settingsScope again.
    runInject(['conversation'], { conversation: { send: async () => {} } })

    styleTag = document.querySelector('style[data-plugin-css="dsh-cursor-theme"]')
  })

  it('bundle applied without errors', () => {
    expect(errors).toEqual([])
  })

  it('injected the style tag', () => {
    expect(styleTag).not.toBeNull()
  })

  it('registered the settings.section entry', () => {
    expect(registered).not.toBeNull()
    expect((registered?.options as Record<string, unknown>)?.name).toBe('settings.section')
    expect((registered?.options as Record<string, unknown>)?.id).toBe('cursor-theme')
  })

  it('registered component renders without throwing', () => {
    const comp = registered?.component as (props: Record<string, unknown>) => unknown
    expect(typeof comp).toBe('function')
    const scope = { getSnapshot: () => ({ status: 'ready' as const, value: { enabled: true, fallback: 'auto', defaultSize: 32, states: {} }, writable: true }), subscribe: () => () => {}, set: async () => {}, unset: async () => {} }
    // The bundle's JSX was compiled to react/jsx-runtime calls; render inside
    // React's own runtime with the scope/t props the host injects.
    expect(() => render(React.createElement(comp as never, { scope, t: (k: string) => k }))).not.toThrow()
    expect(document.body.textContent?.length ?? 0).toBeGreaterThan(0)
  })
})
