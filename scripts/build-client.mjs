/**
 * dsh-cursor-theme client build.
 *
 * Bundles src/client/* into ONE self-contained CommonJS file with esbuild,
 * externalizing only the modules the host's __ModuleLoader__ injects
 * (react, react/jsx-runtime, @deepseek-ai/*). All plugin-local modules
 * (style/states/locales/section) are inlined, so the wrapped bundle has no
 * relative requires — required by the host loader, which resolves only its
 * own module table (same shape as dshmarket / official client bundles).
 *
 * Output: .build/bundle.js (esbuild CJS) → client/client.js (banner-wrapped)
 */
import { buildSync } from 'esbuild'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outFile = join(root, '.build', 'bundle.js')
const outputPath = join(root, 'client', 'client.js')
const bundleId = 'dsh-cursor-theme'

const result = buildSync({
  entryPoints: [join(root, 'src', 'client', 'index.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  outfile: outFile,
  // Host-injected modules: resolved by the loader at runtime, never bundled.
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    '@deepseek-ai/*',
  ],
  logLevel: 'warning',
})

const compiled = readFileSync(outFile, 'utf8')

// The host's __ModuleLoader__ only passes `require` into the factory. esbuild's
// CJS output writes `module.exports`, so we must shim `module`/`exports` locally
// (same shape as dshmarket / tsdown clientBundle). Without this shim the loader
// throws ReferenceError: module is not defined at materialization time.
const banner = `window.__ModuleLoader__.load({ id: ${JSON.stringify(bundleId)}, factory: (require) => {
  var module = { exports: {} };
  var exports = module.exports;
${compiled}
  return module.exports;
}});
`

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, banner)
console.log(`wrote ${outputPath} (${banner.length} bytes)`)
