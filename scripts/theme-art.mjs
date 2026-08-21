/**
 * Creative theme art library (M8).
 *
 * Original hand-drawn vector art for the creative preset themes. Each theme
 * defines per-state SVG bodies (32×32, no <svg>/<defs> wrapper — the
 * generator adds the header, gradient defs and palette). Placeholders
 * {primary}/{accent}/{dark} are substituted at render time.
 *
 * Themes may also carry a decorator ('glow' neon / 'gloss' candy / 'dots'
 * pop / 'thick' hi-vis) applied by the generator before palette substitution.
 *
 * All art is original — no third-party assets, no license concerns.
 */

/** Cream gradient fill reference used by most bodies. */
const G = 'url(#g)'

// =====================================================================
// 1. 猫爪 Paw — rounded chubby cat paw, warm cream/brown/pink
// =====================================================================

/** Cat paw pad (used as arrow tip / pointer element). */
const pawPad = (cx, cy, s = 1) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <ellipse cx="0" cy="6" rx="7" ry="5.4" fill="${G}" stroke="{dark}" stroke-width="1.3"/>
    <circle cx="-6" cy="-1" r="2.6" fill="${G}" stroke="{dark}" stroke-width="1.1"/>
    <circle cx="0" cy="-2.6" r="2.7" fill="${G}" stroke="{dark}" stroke-width="1.1"/>
    <circle cx="6" cy="-1" r="2.6" fill="${G}" stroke="{dark}" stroke-width="1.1"/>
    <ellipse cx="0" cy="6.4" rx="3.4" ry="2.4" fill="{accent}"/>
  </g>`

/** Paw fist (grabbing). */
const pawFist = (cx, cy, s = 1) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <ellipse cx="0" cy="4" rx="8.5" ry="7.5" fill="${G}" stroke="{dark}" stroke-width="1.4"/>
    <path d="M-7 1 Q-8 -4 -4 -4.5 Q0 -5 4 -4 Q8 -3 7.5 1 L7.5 4 L-7.5 4 Z" fill="${G}" stroke="{dark}" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M-4 -4 Q-1 -5.5 2 -4.5 M4.5 -3.6 Q6 -3 6.5 -1.5" stroke="{dark}" stroke-width="1" fill="none"/>
    <ellipse cx="0" cy="6" rx="2.6" ry="1.9" fill="{accent}"/>
  </g>`

/** Paw hand, fingers spread (grab). */
const pawHand = (cx, cy, s = 1) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <ellipse cx="0" cy="5" rx="8" ry="6.6" fill="${G}" stroke="{dark}" stroke-width="1.4"/>
    <ellipse cx="-7" cy="-2.5" rx="2.4" ry="3.6" fill="${G}" stroke="{dark}" stroke-width="1.1"/>
    <ellipse cx="-2.5" cy="-4.6" rx="2.4" ry="4" fill="${G}" stroke="{dark}" stroke-width="1.1"/>
    <ellipse cx="3" cy="-4.4" rx="2.4" ry="3.9" fill="${G}" stroke="{dark}" stroke-width="1.1"/>
    <ellipse cx="7.4" cy="-1.8" rx="2.2" ry="3.3" fill="${G}" stroke="{dark}" stroke-width="1.1"/>
    <ellipse cx="0" cy="6" rx="2.8" ry="2" fill="{accent}"/>
  </g>`

/** Cute cat face (ears + eyes + muzzle). */
const catFace = (cx, cy, s = 1) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M-10 0 L-12 -7 L-5.5 -4.5 Z" fill="{dark}"/>
    <path d="M10 0 L12 -7 L5.5 -4.5 Z" fill="{dark}"/>
    <ellipse cx="0" cy="2" rx="11" ry="9.5" fill="${G}" stroke="{dark}" stroke-width="1.5"/>
    <path d="M-5 -1 Q0 2 5 -1 M-3.5 1.5 Q0 3.5 3.5 1.5" stroke="{dark}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <circle cx="-4.5" cy="0" r="1.4" fill="{dark}"/><circle cx="4.5" cy="0" r="1.4" fill="{dark}"/>
    <path d="M-2 5.5 Q0 8 2 5.5" stroke="{dark}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="-7.5" cy="6" rx="2" ry="1.2" fill="{accent}" opacity="0.7"/>
    <ellipse cx="7.5" cy="6" rx="2" ry="1.2" fill="{accent}" opacity="0.7"/>
  </g>`

const catEar = (dir) => `<path d="M${dir === 'l' ? '-12 8 L-13 -1 L-6 2' : '12 8 L13 -1 L6 2'} Z" fill="{dark}"/>`

export const PAW = {
  id: 'paw', name: '猫爪 Paw', description: '圆润猫爪 · 奶油棕粉',
  palette: { primary: '#F6E3D3', accent: '#FF9EB5', dark: '#8B5E3C' },
  art: {
    'default': `<path d="M4 3 L20 12.5 L13.8 13.6 L16.9 21.8 L13.6 22.9 L10.5 15.2 L5.6 17.6 Z" fill="${G}" stroke="{dark}" stroke-width="1.5" stroke-linejoin="round"/>${pawPad(10, 9.5, 0.55)}`,
    'pointer': pawHand(13, 15, 1.05),
    'text': `<rect x="12" y="3" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/>${catEar('l')}${catEar('r')}<rect x="12" y="25.8" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="14.9" y="5" width="2.2" height="22" rx="1.1" fill="${G}" stroke="{dark}" stroke-width="1.1"/>`,
    'wait': `<circle cx="16" cy="16" r="11.5" fill="none" stroke="{dark}" stroke-width="2.4" stroke-dasharray="14 8" stroke-linecap="round"/>${pawPad(16, 16, 0.62)}`,
    'help': `${catFace(16, 15.5, 0.9)}<path d="M11.5 12.5 C11.5 10 13.2 8.5 15 8.5 C17.2 8.5 18.8 10 18.8 11.8 C18.8 13.8 17.2 14.8 15.8 15.5 C14.8 16 14.6 16.6 14.6 17.6" fill="none" stroke="{dark}" stroke-width="1.8" stroke-linecap="round"/><circle cx="14.6" cy="20.5" r="1.4" fill="{dark}"/>`,
    'not-allowed': `<circle cx="16" cy="16" r="12" fill="none" stroke="#D32F2F" stroke-width="2.6"/><path d="M8.5 8.5 L23.5 23.5" stroke="#D32F2F" stroke-width="2.6" stroke-linecap="round"/>${pawPad(16, 16.5, 0.55)}`,
    'grab': pawHand(16, 16, 1.1),
    'grabbing': pawFist(16, 16, 1.1),
    'progress': `${catFace(16, 12.5, 0.62)}<path d="M5.5 24.5 A11.5 11.5 0 0 1 26.5 24.5" fill="none" stroke="{dark}" stroke-width="2.6" stroke-linecap="round"/><circle cx="5.5" cy="24.5" r="2" fill="{accent}" stroke="{dark}" stroke-width="1"/>`,
    'cell': `<rect x="6" y="6" width="20" height="20" rx="5" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M6 16 L26 16 M16 6 L16 26" stroke="{dark}" stroke-width="1.6"/>${catEar('l')}${catEar('r')}`,
    'copy': `<rect x="5" y="5" width="15" height="15" rx="4" fill="#EFE3D3" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="12" width="15" height="15" rx="4" fill="${G}" stroke="{dark}" stroke-width="1.3"/>${pawPad(19, 19, 0.35)}`,
    'move': `<path d="M16 2.5 L20 9 L12 9 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29.5 L20 23 L12 23 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M2.5 16 L9 12 L9 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29.5 16 L23 12 L23 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${pawPad(16, 16, 0.42)}`,
    'resize-ew': `<path d="M3 16 L10 10.5 L10 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29 16 L22 10.5 L22 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${pawPad(16, 16, 0.4)}`,
    'resize-ns': `<path d="M16 3 L10.5 10 L21.5 10 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29 L10.5 22 L21.5 22 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${pawPad(16, 16, 0.4)}`,
  },
}

// =====================================================================
// 2. 能量充能 Energy — battery / bolt semantics, electric yellow-blue
// =====================================================================

const bolt = (cx, cy, s = 1, fill = G) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M4 10 L14 -2 L10.5 7 L18 7 L7 18 L10 9.5 Z" fill="${fill}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>
  </g>`

const battery = (cx, cy, s = 1, fillLevel = 3) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <rect x="-8" y="-6" width="16" height="12" rx="2.5" fill="${G}" stroke="{dark}" stroke-width="1.3"/>
    <rect x="8" y="-3.4" width="2" height="6.8" rx="1" fill="${G}" stroke="{dark}" stroke-width="1"/>
    ${fillLevel >= 1 ? '<rect x="-6.2" y="-4.2" width="3.4" height="8.4" rx="1" fill="{primary}"/>' : ''}
    ${fillLevel >= 2 ? '<rect x="-1.7" y="-4.2" width="3.4" height="8.4" rx="1" fill="{primary}"/>' : ''}
    ${fillLevel >= 3 ? '<rect x="2.8" y="-4.2" width="3.4" height="8.4" rx="1" fill="{primary}"/>' : ''}
  </g>`

export const ENERGY = {
  id: 'energy', name: '能量充能 Energy', description: '电池闪电 · 充电语义',
  palette: { primary: '#FFD93D', accent: '#6BCBFF', dark: '#1B2A4A' },
  art: {
    'default': `<path d="M4 3 L19.5 12.5 L13.6 13.5 L16.7 21 L13.6 22.1 L10.6 15 L5.8 17.3 Z" fill="${G}" stroke="{dark}" stroke-width="1.4" stroke-linejoin="round"/>${bolt(13, 13, 0.4)}`,
    'pointer': `<path d="M6.5 15.5 L6.5 9 C6.5 7.6 7.8 6.8 9 7.6 L9.4 7.9 L9.4 6 C9.4 4.6 10.7 3.8 11.9 4.6 L12.3 4.9 L12.3 3.6 C12.3 2.2 13.6 1.4 14.8 2.2 L15 2.4 L15 10.5 C18 11.5 20.5 14 21 17.5 C21.5 21.5 18.5 24.5 14.5 24.8 C11 25 7.5 21 6.5 15.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.3" stroke-linejoin="round"/>${bolt(12, 12, 0.3)}`,
    'text': `<rect x="12" y="3" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="25.8" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="14.9" y="5" width="2.2" height="22" rx="1.1" fill="${G}" stroke="{dark}" stroke-width="1.1"/>${bolt(25, 4, 0.3)}`,
    'wait': `<circle cx="16" cy="16" r="11.5" fill="none" stroke="{dark}" stroke-width="2.4" stroke-dasharray="14 8" stroke-linecap="round"/>${battery(16, 16, 0.85, 2)}`,
    'help': `<circle cx="16" cy="16" r="12" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M12.5 12 C12.5 9.5 14 8 16 8 C18.2 8 19.5 9.7 19.5 11.5 C19.5 13.6 17.8 14.6 16.3 15.4 C15.2 16 14.8 16.8 14.8 18" fill="none" stroke="{dark}" stroke-width="2.2" stroke-linecap="round"/><circle cx="14.8" cy="21.5" r="1.6" fill="{dark}"/>${bolt(24, 5, 0.32)}`,
    'not-allowed': `<circle cx="16" cy="16" r="12" fill="none" stroke="#D32F2F" stroke-width="2.6"/><path d="M8.5 8.5 L23.5 23.5" stroke="#D32F2F" stroke-width="2.6" stroke-linecap="round"/>${battery(16, 17, 0.7, 0)}`,
    'grab': `<ellipse cx="16" cy="16" rx="9" ry="8" fill="${G}" stroke="{dark}" stroke-width="1.4"/>${bolt(16, 13, 0.5)}<path d="M11 20 Q13 22.5 16 22.5 Q19 22.5 21 20" stroke="{dark}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`,
    'grabbing': `<ellipse cx="16" cy="17" rx="9.5" ry="8" fill="${G}" stroke="{dark}" stroke-width="1.4"/><path d="M9 12 Q8.5 7.5 13 7 Q17 6.5 20 8.5 Q23 10.5 23 14 L23 16 L9 16 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${bolt(22, 4, 0.28)}`,
    'progress': `<rect x="4" y="17" width="24" height="8" rx="4" fill="${G}" stroke="{dark}" stroke-width="1.4"/><rect x="6.5" y="19.5" width="16" height="3" rx="1.5" fill="{primary}"/><circle cx="26" cy="21" r="1.8" fill="{accent}" stroke="{dark}" stroke-width="1"/>${bolt(12, 6, 0.5)}`,
    'cell': `<rect x="6" y="6" width="20" height="20" rx="5" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M6 16 L26 16 M16 6 L16 26" stroke="{dark}" stroke-width="1.6"/>${bolt(16, 12, 0.35)}`,
    'copy': `<rect x="5" y="5" width="15" height="15" rx="4" fill="#E8ECF5" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="12" width="15" height="15" rx="4" fill="${G}" stroke="{dark}" stroke-width="1.3"/>${bolt(19, 19, 0.3)}`,
    'move': `<path d="M16 2.5 L20 9 L12 9 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29.5 L20 23 L12 23 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M2.5 16 L9 12 L9 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29.5 16 L23 12 L23 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${bolt(16, 16, 0.42)}`,
    'resize-ew': `<path d="M3 16 L10 10.5 L10 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29 16 L22 10.5 L22 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${bolt(16, 16, 0.38)}`,
    'resize-ns': `<path d="M16 3 L10.5 10 L21.5 10 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29 L10.5 22 L21.5 22 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${bolt(16, 16, 0.38)}`,
  },
}

// =====================================================================
// 4. 表情包 Emoji — every state is a round face with an expression
// =====================================================================

/** Round face base with given eyes/mouth (templates with placeholders). */
const emojiFace = (eyes, mouth, extra = '', cx = 16, cy = 16, r = 12) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${G}" stroke="{dark}" stroke-width="1.6"/>
  ${eyes}
  ${mouth}
  ${extra}`

const EYE_DOT = `<circle cx="11.5" cy="14.5" r="2" fill="{dark}"/><circle cx="20.5" cy="14.5" r="2" fill="{dark}"/>`
const EYE_LINE = `<path d="M9.5 14.5 L13.5 14.5 M18.5 14.5 L22.5 14.5" stroke="{dark}" stroke-width="2" stroke-linecap="round"/>`
const EYE_HAPPY = `<path d="M9.5 15 Q11.5 12.5 13.5 15 M18.5 15 Q20.5 12.5 22.5 15" stroke="{dark}" stroke-width="2" fill="none" stroke-linecap="round"/>`
const EYE_WINK = `<circle cx="20.5" cy="14.5" r="2" fill="{dark}"/><path d="M9.5 14.5 L13.5 14.5" stroke="{dark}" stroke-width="2" stroke-linecap="round"/>`

const MOUTH_SMILE = `<path d="M11.5 19.5 Q16 24.5 20.5 19.5" stroke="{dark}" stroke-width="2" fill="none" stroke-linecap="round"/>`
const MOUTH_OPEN = `<ellipse cx="16" cy="20.5" rx="3.4" ry="3" fill="{dark}"/>`
const MOUTH_O = `<circle cx="16" cy="20.5" r="2.8" fill="{dark}"/>`
const MOUTH_FLAT = `<path d="M11.5 20 L20.5 20" stroke="{dark}" stroke-width="2" stroke-linecap="round"/>`
const MOUTH_SAD = `<path d="M11.5 21.5 Q16 17 20.5 21.5" stroke="{dark}" stroke-width="2" fill="none" stroke-linecap="round"/>`

export const EMOJI = {
  id: 'emoji', name: '表情包 Emoji', description: '圆脸表情 · 情绪光标',
  palette: { primary: '#FFD93D', accent: '#FF9EB5', dark: '#3E2723' },
  art: {
    'default': emojiFace(EYE_HAPPY, MOUTH_SMILE),
    'pointer': emojiFace(EYE_DOT, MOUTH_SMILE, `<path d="M15 26 L15 18 M13 21 L15 18 L17 21" stroke="{dark}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    'text': `<rect x="12" y="3" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="25.8" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><circle cx="16" cy="16" r="7" fill="${G}" stroke="{dark}" stroke-width="1.4"/><circle cx="13" cy="14" r="1.2" fill="{dark}"/><circle cx="19" cy="14" r="1.2" fill="{dark}"/><path d="M13 19 Q16 21.5 19 19" stroke="{dark}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
    'wait': `<circle cx="16" cy="16" r="11.5" fill="none" stroke="{dark}" stroke-width="2.4" stroke-dasharray="14 8" stroke-linecap="round"/>${emojiFace(EYE_LINE, MOUTH_O, '', 16, 16, 7.5)}`,
    'help': emojiFace(EYE_DOT, MOUTH_O, `<path d="M20 8 C22.8 8 24.5 9.8 24.5 11.8 C24.5 13.8 22.8 14.6 21.2 15.4 C20 16 19.8 16.5 19.8 17.5" fill="none" stroke="{dark}" stroke-width="1.8" stroke-linecap="round"/><circle cx="19.8" cy="20" r="1.3" fill="{dark}"/>`),
    'not-allowed': emojiFace(EYE_DOT, MOUTH_FLAT, `<circle cx="16" cy="16" r="12" fill="none" stroke="#D32F2F" stroke-width="2.6"/><path d="M8.5 8.5 L23.5 23.5" stroke="#D32F2F" stroke-width="2.6" stroke-linecap="round"/>`),
    'grab': emojiFace(EYE_DOT, MOUTH_SMILE, `<path d="M8 9 L8 5 Q8 2.5 10.5 2.5 L21.5 2.5 Q24 2.5 24 5 L24 9" stroke="{dark}" stroke-width="2" fill="none" stroke-linecap="round"/>`),
    'grabbing': emojiFace(EYE_LINE, MOUTH_FLAT, `<ellipse cx="16" cy="9" rx="7" ry="3.6" fill="${G}" stroke="{dark}" stroke-width="1.4"/>`),
    'progress': emojiFace(EYE_HAPPY, MOUTH_OPEN, `<path d="M5.5 24.5 A11.5 11.5 0 0 1 26.5 24.5" fill="none" stroke="{dark}" stroke-width="2.6" stroke-linecap="round"/><circle cx="5.5" cy="24.5" r="2" fill="{accent}" stroke="{dark}" stroke-width="1"/>`),
    'cell': `<rect x="6" y="6" width="20" height="20" rx="5" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M6 16 L26 16 M16 6 L16 26" stroke="{dark}" stroke-width="1.6"/>${emojiFace(EYE_DOT, MOUTH_SMILE, '', 16, 16, 6)}`,
    'copy': `<rect x="5" y="5" width="15" height="15" rx="4" fill="#F0E6C8" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="12" width="15" height="15" rx="4" fill="${G}" stroke="{dark}" stroke-width="1.3"/>${emojiFace(EYE_HAPPY, MOUTH_SMILE, '', 19, 19, 5.5)}`,
    'move': `<path d="M16 2.5 L20 9 L12 9 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29.5 L20 23 L12 23 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M2.5 16 L9 12 L9 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29.5 16 L23 12 L23 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${emojiFace(EYE_HAPPY, MOUTH_SMILE, '', 16, 16, 5.5)}`,
    'resize-ew': `<path d="M3 16 L10 10.5 L10 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29 16 L22 10.5 L22 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${emojiFace(EYE_WINK, MOUTH_SMILE, '', 16, 16, 5.5)}`,
    'resize-ns': `<path d="M16 3 L10.5 10 L21.5 10 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29 L10.5 22 L21.5 22 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${emojiFace(EYE_DOT, MOUTH_SMILE, '', 16, 16, 5.5)}`,
  },
}

// =====================================================================
// 5. 像素 8-bit — retro pixel art via rect grids
// =====================================================================

/**
 * Build pixel art from ASCII rows. '#' = dark, '+' = accent, else primary.
 * Each char maps to a 2×2 rect in a 16×16 grid (32×32 output).
 */
const px = (rows) => {
  const rects = []
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const c = rows[y][x]
      if (c === '.') continue
      const fill = c === '#' ? '{dark}' : c === '+' ? '{accent}' : '{primary}'
      rects.push(`<rect x="${x * 2}" y="${y * 2}" width="2" height="2" fill="${fill}"/>`)
    }
  }
  return rects.join('')
}

const PX_ARROW = [
  'X...............',
  'XX..............',
  'XXX.............',
  'XXXX............',
  'XXXXX...........',
  '.XXXXX..........',
  '..XXXXX...X.....',
  '...XXXXXXX......',
  '....XXXXX.......',
  '.....XXX........',
  '....X.XX........',
  '...XX..X........',
  '..XX............',
  '.X..............',
  '................',
  '................',
]
const PX_HAND = [
  '................',
  '....X....X......',
  '....X....X......',
  '....X....X......',
  '....XXXXXX......',
  '....XXXXXX......',
  '....XXXXXXXX....',
  '....XXXXXXXX....',
  '....XXXXXXXXXX..',
  '....XXXXXXXXXX..',
  '....XXXXXXXX....',
  '....XXXXXXXX....',
  '.....XXXXXX.....',
  '.....XXXXXX.....',
  '................',
  '................',
]
const PX_TEXT = [
  '.....XXXXX......',
  '.....XXXXX......',
  '.......X........',
  '.......X........',
  '.......X........',
  '.......X........',
  '.......X........',
  '.......X........',
  '.......X........',
  '.......X........',
  '.......X........',
  '.......X........',
  '.......X........',
  '.......X........',
  '.....XXXXX......',
  '.....XXXXX......',
]
const PX_WAIT = [
  '................',
  '....XXXXXXX.....',
  '...X.......X....',
  '..X...XXX...X...',
  '..X..X...X..X...',
  '..X..X...X..X...',
  '..X..X...X..X...',
  '...X..XXX..X....',
  '....X.....X.....',
  '.....X...X......',
  '......X.X.......',
  '.......X........',
  '................',
  '................',
  '................',
  '................',
]
const PX_HELP = [
  '................',
  '....XXXXXXX.....',
  '...X.......X....',
  '..X....+....X...',
  '..X....X....X...',
  '..X...XX....X...',
  '...X..XX...X....',
  '....XXXXXXX.....',
  '......XXX.......',
  '......XXX.......',
  '......XXX.......',
  '......XXX.......',
  '................',
  '......XXX.......',
  '......XXX.......',
  '................',
]
const PX_BAN = [
  '................',
  '....XXXXXXX.....',
  '...X.......X....',
  '..X..XX..XX.X...',
  '..X..XX..XX..X..',
  '..X..XX..XX..X..',
  '..X..XX..XX..X..',
  '..X..XX..XX..X..',
  '..X..XX..XX..X..',
  '..X..XX..XX..X..',
  '..X..XX..XX..X..',
  '..X..XX..XX..X..',
  '...X.......X....',
  '....XXXXXXX.....',
  '................',
  '................',
]
const PX_GRAB = [
  '................',
  '..X.....X.......',
  '..XX...XX.......',
  '..X.....X.......',
  '..XXXXXXXX......',
  '..XXXXXXXX......',
  '..XXXXXXXXXX....',
  '..XXXXXXXXXX....',
  '..XXXXXXXXXX....',
  '..XXXXXXXXXX....',
  '..XXXXXXXX......',
  '..XXXXXXXX......',
  '...XXXXXX.......',
  '...XXXXXX.......',
  '................',
  '................',
]
const PX_GRABBING = [
  '................',
  '....XXXXXXXX....',
  '....XXXXXXXX....',
  '....XXXXXXXX....',
  '....XXXXXXXX....',
  '....XXXXXXXX....',
  '....XXXXXXXXXX..',
  '....XXXXXXXXXX..',
  '....XXXXXXXXXX..',
  '....XXXXXXXXXX..',
  '....XXXXXXXX....',
  '....XXXXXXXX....',
  '.....XXXXXX.....',
  '.....XXXXXX.....',
  '................',
  '................',
]
const PX_PROGRESS = [
  '................',
  '................',
  '.......XX.......',
  '......XXXX......',
  '......XXXX......',
  '......XXXX......',
  '......XXXX......',
  '.......XX.......',
  '.......XX.......',
  '................',
  '....XXXXXXX.....',
  '....XXXXXXX.....',
  '....XXXXXXX.....',
  '....XXXXXXX.....',
  '................',
  '................',
]
const PX_CELL = [
  '................',
  '....XXXXXXXX....',
  '....X......X....',
  '....X......X....',
  '....X......X....',
  '....X......X....',
  '....XXXXXXXX....',
  '....X......X....',
  '....X......X....',
  '....X......X....',
  '....X......X....',
  '....XXXXXXXX....',
  '................',
  '................',
  '................',
  '................',
]
const PX_COPY = [
  '................',
  '.....XXXXX......',
  '.....X...X......',
  '.....X...X......',
  '.....XXXXX......',
  '..XXXXXXXXXXX...',
  '..X.........X...',
  '..X.........X...',
  '..X.........X...',
  '..X.........X...',
  '..XXXXXXXXXXX...',
  '................',
  '................',
  '................',
  '................',
  '................',
]
const PX_MOVE = [
  '.......XX.......',
  '.......XX.......',
  '.......XX.......',
  '......XXXX......',
  '......XXXX......',
  '.....XXXXXX.....',
  '....XXXXXXXX....',
  'XXXXXX..XXXXXX..',
  '....XXXXXXXX....',
  '.....XXXXXX.....',
  '......XXXX......',
  '......XXXX......',
  '.......XX.......',
  '.......XX.......',
  '.......XX.......',
  '................',
]
const PX_EW = [
  '..XX..........XX',
  '..XX..........XX',
  '..XX..........XX',
  '..XXX........XXX',
  '..XXX........XXX',
  '..XXXXXXXXXXXXXXXX',
  '..XXXXXXXXXXXXXXX.',
  '..XXX........XXX.',
  '..XXX........XXX.',
  '..XX..........XX.',
  '..XX..........XX.',
  '..XX..........XX.',
  '................',
  '................',
  '................',
  '................',
]
const PX_NS = [
  '.......XX.......',
  '.......XX.......',
  '.......XX.......',
  '......XXXX......',
  '......XXXX......',
  '.....XXXXXX.....',
  '....XXXXXXXX....',
  '....XXXXXXXX....',
  '.....XXXXXX.....',
  '......XXXX......',
  '......XXXX......',
  '.......XX.......',
  '.......XX.......',
  '.......XX.......',
  '.......XX.......',
  '.......XX.......',
]

export const PIXEL = {
  id: 'pixel', name: '像素 8-bit', description: '复古像素 · 游戏风',
  palette: { primary: '#39FF14', accent: '#FFD93D', dark: '#0D0D0D' },
  art: {
    'default': px(PX_ARROW),
    'pointer': px(PX_HAND),
    'text': px(PX_TEXT),
    'wait': px(PX_WAIT),
    'help': px(PX_HELP),
    'not-allowed': px(PX_BAN),
    'grab': px(PX_GRAB),
    'grabbing': px(PX_GRABBING),
    'progress': px(PX_PROGRESS),
    'cell': px(PX_CELL),
    'copy': px(PX_COPY),
    'move': px(PX_MOVE),
    'resize-ew': px(PX_EW),
    'resize-ns': px(PX_NS),
  },
}

// =====================================================================
// 6. 天气 Weather — sun/cloud/rain semantic icons
// =====================================================================

const cloud = (cx, cy, s = 1, fill = G) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M-8 5 Q-11 5 -11 2 Q-11 -1.5 -7.5 -1.5 Q-7 -5 -3 -5 Q0.5 -8 3.5 -5.5 Q6 -6 7 -3.5 Q10 -3 10 0 Q10 5 -8 5 Z" fill="${fill}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>
  </g>`

const sun = (cx, cy, s = 1, fill = G) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <circle cx="0" cy="0" r="6" fill="${fill}" stroke="{dark}" stroke-width="1.3"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M0 ${-9.5} L0 ${-7}" stroke="{dark}" stroke-width="1.6" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}
  </g>`

const drop = (cx, cy, s = 1, fill = G) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M0 -6 C2.5 -2.5 4 0.5 4 2.5 C4 5 2.2 6.5 0 6.5 C-2.2 6.5 -4 5 -4 2.5 C-4 0.5 -2.5 -2.5 0 -6 Z" fill="${fill}" stroke="{dark}" stroke-width="1.1"/>
  </g>`

export const WEATHER = {
  id: 'weather', name: '天气 Weather', description: '晴雨雪 · 气象语义',
  palette: { primary: '#7EC8E3', accent: '#FFD93D', dark: '#3B5B78' },
  art: {
    'default': `<path d="M4 3 L19.5 12.5 L13.6 13.5 L16.7 21 L13.6 22.1 L10.6 15 L5.8 17.3 Z" fill="${G}" stroke="{dark}" stroke-width="1.4" stroke-linejoin="round"/>${sun(14, 13, 0.4)}`,
    'pointer': `<path d="M6.5 15.5 L6.5 9 C6.5 7.6 7.8 6.8 9 7.6 L9.4 7.9 L9.4 6 C9.4 4.6 10.7 3.8 11.9 4.6 L12.3 4.9 L12.3 3.6 C12.3 2.2 13.6 1.4 14.8 2.2 L15 2.4 L15 10.5 C18 11.5 20.5 14 21 17.5 C21.5 21.5 18.5 24.5 14.5 24.8 C11 25 7.5 21 6.5 15.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.3" stroke-linejoin="round"/>${sun(12, 12, 0.32)}`,
    'text': `<rect x="12" y="3" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="25.8" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="14.9" y="5" width="2.2" height="22" rx="1.1" fill="${G}" stroke="{dark}" stroke-width="1.1"/>${drop(25, 5, 0.35)}`,
    'wait': `<circle cx="16" cy="16" r="11.5" fill="none" stroke="{dark}" stroke-width="2.4" stroke-dasharray="14 8" stroke-linecap="round"/>${cloud(16, 15, 0.9)}${drop(10, 22, 0.3)}${drop(15, 24, 0.3)}${drop(20, 22, 0.3)}`,
    'help': `${sun(13, 12, 0.55)}<path d="M12.5 12 C12.5 9.5 14 8 16 8 C18.2 8 19.5 9.7 19.5 11.5 C19.5 13.6 17.8 14.6 16.3 15.4 C15.2 16 14.8 16.8 14.8 18" fill="none" stroke="{dark}" stroke-width="2.2" stroke-linecap="round"/><circle cx="14.8" cy="21.5" r="1.6" fill="{dark}"/>${drop(23, 5, 0.32)}`,
    'not-allowed': `<circle cx="16" cy="16" r="12" fill="none" stroke="#D32F2F" stroke-width="2.6"/><path d="M8.5 8.5 L23.5 23.5" stroke="#D32F2F" stroke-width="2.6" stroke-linecap="round"/>${cloud(16, 17, 0.72)}`,
    'grab': `${cloud(10, 12, 0.6)}${cloud(22, 12, 0.6)}<path d="M8 20 Q11 23 16 23 Q21 23 24 20" stroke="{dark}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
    'grabbing': `${cloud(16, 11, 0.85)}<path d="M9 17 Q8.5 13 12.5 12.5 Q17 12 20.5 14 Q24 16 24 19 L24 21 L9 21 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>`,
    'progress': `<path d="M5.5 24.5 A11.5 11.5 0 0 1 26.5 24.5" fill="none" stroke="{dark}" stroke-width="2.6" stroke-linecap="round"/><circle cx="26.5" cy="24.5" r="2.1" fill="{accent}" stroke="{dark}" stroke-width="1"/>${sun(16, 10, 0.5)}`,
    'cell': `<rect x="6" y="6" width="20" height="20" rx="5" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M6 16 L26 16 M16 6 L16 26" stroke="{dark}" stroke-width="1.6"/>${drop(16, 12, 0.32)}`,
    'copy': `<rect x="5" y="5" width="15" height="15" rx="4" fill="#D8ECF5" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="12" width="15" height="15" rx="4" fill="${G}" stroke="{dark}" stroke-width="1.3"/>${sun(19, 19, 0.3)}`,
    'move': `<path d="M16 2.5 L20 9 L12 9 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29.5 L20 23 L12 23 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M2.5 16 L9 12 L9 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29.5 16 L23 12 L23 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${cloud(16, 16, 0.5)}`,
    'resize-ew': `<path d="M3 16 L10 10.5 L10 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29 16 L22 10.5 L22 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${drop(16, 14, 0.38)}`,
    'resize-ns': `<path d="M16 3 L10.5 10 L21.5 10 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29 L10.5 22 L21.5 22 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${drop(16, 14, 0.38)}`,
  },
}

// =====================================================================
// 7. 折纸 Origami — folded triangles, flat geometric
// =====================================================================

const tri = (pts, fill, dark = true) =>
  `<path d="M${pts.map((p) => p.join(' ')).join(' L')} Z" fill="${fill}"${dark ? ` stroke="{dark}" stroke-width="1" stroke-linejoin="round"` : ''}/>`

export const ORIGAMI = {
  id: 'origami', name: '折纸 Origami', description: '三角折面 · 扁平几何',
  palette: { primary: '#FF6B6B', accent: '#4ECDC4', dark: '#2C3E50' },
  art: {
    'default': `${tri([[4, 3], [19, 12], [4, 14]], '{primary}')}${tri([[13, 13], [16.5, 21], [5, 16]], '{accent}')}${tri([[19, 12], [13, 13], [10, 15]], '{dark}')}`,
    'pointer': `${tri([[7, 16], [7, 7], [10, 10]], '{primary}')}${tri([[10, 10], [10, 4], [14, 7]], '{primary}')}${tri([[14, 7], [14, 10], [17, 12]], '{accent}')}${tri([[17, 12], [20, 15], [14, 22]], '{primary}')}${tri([[7, 16], [14, 22], [9, 24]], '{accent}')}`,
    'text': `${tri([[13, 3], [19, 3], [16, 9]], '{primary}')}${tri([[13, 29], [19, 29], [16, 23]], '{primary}')}${tri([[16, 3], [18, 16], [16, 29]], '{accent}')}${tri([[16, 3], [14, 16], [16, 29]], '{dark}')}`,
    'wait': `${tri([[16, 5], [25, 16], [16, 27]], '{primary}')}${tri([[16, 5], [7, 16], [16, 27]], '{accent}')}<circle cx="16" cy="16" r="2.5" fill="{dark}"/>`,
    'help': `${tri([[16, 4], [26, 14], [16, 12]], '{primary}')}${tri([[16, 4], [6, 14], [16, 12]], '{accent}')}${tri([[16, 10], [20, 20], [16, 27]], '{primary}')}${tri([[16, 10], [12, 20], [16, 27]], '{accent}')}${tri([[16, 10], [16, 16], [19, 15]], '{dark}')}`,
    'not-allowed': `<circle cx="16" cy="16" r="12" fill="none" stroke="#D32F2F" stroke-width="2.6"/><path d="M8.5 8.5 L23.5 23.5" stroke="#D32F2F" stroke-width="2.6" stroke-linecap="round"/>${tri([[16, 10], [20, 15], [16, 20]], '{primary}')}${tri([[16, 10], [12, 15], [16, 20]], '{accent}')}`,
    'grab': `${tri([[8, 9], [12, 13], [8, 13]], '{primary}')}${tri([[13, 7], [17, 11], [13, 11]], '{primary}')}${tri([[18, 8], [22, 12], [18, 12]], '{primary}')}${tri([[7, 12], [23, 12], [23, 20]], '{primary}')}${tri([[7, 12], [23, 20], [7, 20]], '{accent}')}${tri([[12, 17], [20, 17], [16, 22]], '{dark}')}`,
    'grabbing': `${tri([[8, 8], [24, 8], [24, 15]], '{primary}')}${tri([[8, 8], [24, 15], [8, 15]], '{accent}')}${tri([[8, 15], [24, 15], [24, 23]], '{primary}')}${tri([[8, 15], [24, 23], [8, 23]], '{accent}')}`,
    'progress': `${tri([[16, 4], [20, 10], [16, 10]], '{primary}')}${tri([[16, 4], [12, 10], [16, 10]], '{accent}')}${tri([[6, 22], [16, 24], [6, 26]], '{primary}')}${tri([[16, 24], [26, 22], [26, 26]], '{accent}')}${tri([[16, 24], [6, 26], [26, 26]], '{dark}')}`,
    'cell': `${tri([[6, 6], [26, 6], [16, 16]], '{primary}')}${tri([[6, 6], [16, 16], [6, 26]], '{accent}')}${tri([[26, 6], [26, 26], [16, 16]], '{primary}')}${tri([[6, 26], [26, 26], [16, 16]], '{accent}')}`,
    'copy': `${tri([[5, 5], [20, 5], [12, 13]], '#E8D8D8')}${tri([[5, 5], [12, 13], [5, 20]], '#F5E9E9')}${tri([[12, 12], [27, 12], [19, 20]], '{primary}')}${tri([[12, 12], [19, 20], [12, 27]], '{accent}')}${tri([[27, 12], [12, 27], [27, 27]], '{dark}')}`,
    'move': `${tri([[16, 2], [20, 9], [12, 9]], '{primary}')}${tri([[16, 30], [20, 23], [12, 23]], '{accent}')}${tri([[2, 16], [9, 12], [9, 20]], '{primary}')}${tri([[30, 16], [23, 12], [23, 20]], '{accent}')}${tri([[12, 12], [20, 20], [12, 20]], '{dark}')}`,
    'resize-ew': `${tri([[3, 16], [10, 10], [10, 22]], '{primary}')}${tri([[29, 16], [22, 10], [22, 22]], '{accent}')}${tri([[10, 14], [22, 14], [22, 18]], '{dark}')}${tri([[10, 14], [22, 18], [10, 18]], '{primary}')}`,
    'resize-ns': `${tri([[16, 3], [10, 10], [22, 10]], '{primary}')}${tri([[16, 29], [10, 22], [22, 22]], '{accent}')}${tri([[14, 10], [14, 22], [18, 22]], '{dark}')}${tri([[14, 10], [18, 22], [18, 10]], '{primary}')}`,
  },
}

// =====================================================================
// 8. 太空人 Astro — astronaut helmet / spacesuit
// =====================================================================

const helmet = (cx, cy, s = 1, visor = '#6BCBFF') => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <circle cx="0" cy="0" r="8" fill="${G}" stroke="{dark}" stroke-width="1.4"/>
    <ellipse cx="1.5" cy="1" rx="5.4" ry="5" fill="${visor}" stroke="{dark}" stroke-width="1.1"/>
    <circle cx="3" cy="-0.5" r="1" fill="#FFFFFF" opacity="0.85"/>
    <path d="M-7 6 Q0 10 7 6" stroke="{dark}" stroke-width="1.2" fill="none"/>
  </g>`

export const ASTRO = {
  id: 'astro', name: '太空人 Astro', description: '宇航员 · 太空漫游',
  palette: { primary: '#FFFFFF', accent: '#6BCBFF', dark: '#1B2A4A' },
  art: {
    'default': `<path d="M4 3 L19.5 12.5 L13.6 13.5 L16.7 21 L13.6 22.1 L10.6 15 L5.8 17.3 Z" fill="${G}" stroke="{dark}" stroke-width="1.4" stroke-linejoin="round"/>${helmet(15, 14, 0.55)}`,
    'pointer': `<path d="M6.5 15.5 L6.5 9 C6.5 7.6 7.8 6.8 9 7.6 L9.4 7.9 L9.4 6 C9.4 4.6 10.7 3.8 11.9 4.6 L12.3 4.9 L12.3 3.6 C12.3 2.2 13.6 1.4 14.8 2.2 L15 2.4 L15 10.5 C18 11.5 20.5 14 21 17.5 C21.5 21.5 18.5 24.5 14.5 24.8 C11 25 7.5 21 6.5 15.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.3" stroke-linejoin="round"/>${helmet(13, 12, 0.4)}`,
    'text': `<rect x="12" y="3" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="25.8" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="14.9" y="5" width="2.2" height="22" rx="1.1" fill="${G}" stroke="{dark}" stroke-width="1.1"/><path d="M16 3 L20 -1 M16 3 L19 2.5" stroke="{dark}" stroke-width="1.2" stroke-linecap="round"/>`,
    'wait': `<circle cx="16" cy="16" r="11.5" fill="none" stroke="{dark}" stroke-width="2.4" stroke-dasharray="14 8" stroke-linecap="round"/>${helmet(16, 16, 0.75)}<circle cx="8" cy="10" r="1.6" fill="{accent}" opacity="0.6"/><circle cx="24" cy="11" r="1.2" fill="{accent}" opacity="0.5"/>`,
    'help': `<circle cx="16" cy="16" r="12" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M12.5 12 C12.5 9.5 14 8 16 8 C18.2 8 19.5 9.7 19.5 11.5 C19.5 13.6 17.8 14.6 16.3 15.4 C15.2 16 14.8 16.8 14.8 18" fill="none" stroke="{dark}" stroke-width="2.2" stroke-linecap="round"/><circle cx="14.8" cy="21.5" r="1.6" fill="{dark}"/>${helmet(24, 5, 0.32)}`,
    'not-allowed': `<circle cx="16" cy="16" r="12" fill="none" stroke="#D32F2F" stroke-width="2.6"/><path d="M8.5 8.5 L23.5 23.5" stroke="#D32F2F" stroke-width="2.6" stroke-linecap="round"/>${helmet(16, 16.5, 0.6)}`,
    'grab': `<ellipse cx="16" cy="19" rx="9" ry="7.5" fill="${G}" stroke="{dark}" stroke-width="1.4"/><ellipse cx="9" cy="10.5" rx="2.6" ry="3.8" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="14.5" cy="8.5" rx="2.6" ry="4.2" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="20" cy="9.5" rx="2.6" ry="4" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="24.5" cy="12.5" rx="2.4" ry="3.4" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="16" cy="21" rx="2.6" ry="2" fill="{accent}"/>`,
    'grabbing': `<ellipse cx="16" cy="18" rx="10" ry="8.5" fill="${G}" stroke="{dark}" stroke-width="1.4"/><path d="M8.5 12.5 Q8 8 12 7.5 Q16 7 19 8.5 Q22.5 10 22.5 14 L22.5 16 L8.5 16 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="16" cy="20.5" rx="2.8" ry="2" fill="{accent}"/>`,
    'progress': `<path d="M5.5 24.5 A11.5 11.5 0 0 1 26.5 24.5" fill="none" stroke="{dark}" stroke-width="2.6" stroke-linecap="round"/>${helmet(16, 10, 0.62)}<circle cx="26.5" cy="24.5" r="2" fill="{accent}" stroke="{dark}" stroke-width="1"/>`,
    'cell': `<rect x="6" y="6" width="20" height="20" rx="5" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M6 16 L26 16 M16 6 L16 26" stroke="{dark}" stroke-width="1.6"/><circle cx="10" cy="10" r="1.4" fill="{accent}"/><circle cx="22" cy="22" r="1.4" fill="{accent}"/>`,
    'copy': `<rect x="5" y="5" width="15" height="15" rx="4" fill="#E8EEF7" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="12" width="15" height="15" rx="4" fill="${G}" stroke="{dark}" stroke-width="1.3"/>${helmet(19, 19, 0.35)}`,
    'move': `<path d="M16 2.5 L20 9 L12 9 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29.5 L20 23 L12 23 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M2.5 16 L9 12 L9 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29.5 16 L23 12 L23 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${helmet(16, 16, 0.4)}`,
    'resize-ew': `<path d="M3 16 L10 10.5 L10 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29 16 L22 10.5 L22 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${helmet(16, 16, 0.38)}`,
    'resize-ns': `<path d="M16 3 L10.5 10 L21.5 10 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29 L10.5 22 L21.5 22 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${helmet(16, 16, 0.38)}`,
  },
}

// =====================================================================
// 10. 幽灵小镇 Ghost — cute spooky ghosts
// =====================================================================

const ghost = (cx, cy, s = 1, fill = G) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M-8 6 C-8 -2 -4 -7 0 -7 C4 -7 8 -2 8 6 L8 12 L5.5 10 L3.5 12 L0 10 L-3.5 12 L-5.5 10 L-8 12 Z" fill="${fill}" stroke="{dark}" stroke-width="1.3" stroke-linejoin="round"/>
    <circle cx="-3.2" cy="-1" r="1.4" fill="{dark}"/><circle cx="3.2" cy="-1" r="1.4" fill="{dark}"/>
    <path d="M-2.5 3 Q0 5.5 2.5 3" stroke="{dark}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  </g>`

export const GHOST = {
  id: 'ghost', name: '幽灵小镇 Ghost', description: '幽灵 · 万圣可爱',
  palette: { primary: '#D6D6EC', accent: '#8E8EB8', dark: '#4A4A6A' },
  art: {
    'default': `<path d="M4 3 L19.5 12.5 L13.6 13.5 L16.7 21 L13.6 22.1 L10.6 15 L5.8 17.3 Z" fill="${G}" stroke="{dark}" stroke-width="1.4" stroke-linejoin="round"/>${ghost(15, 14, 0.5)}`,
    'pointer': `<path d="M6.5 15.5 L6.5 9 C6.5 7.6 7.8 6.8 9 7.6 L9.4 7.9 L9.4 6 C9.4 4.6 10.7 3.8 11.9 4.6 L12.3 4.9 L12.3 3.6 C12.3 2.2 13.6 1.4 14.8 2.2 L15 2.4 L15 10.5 C18 11.5 20.5 14 21 17.5 C21.5 21.5 18.5 24.5 14.5 24.8 C11 25 7.5 21 6.5 15.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.3" stroke-linejoin="round"/>${ghost(13, 12, 0.36)}`,
    'text': `<rect x="12" y="3" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="25.8" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="14.9" y="5" width="2.2" height="22" rx="1.1" fill="${G}" stroke="{dark}" stroke-width="1.1"/>${ghost(25, 5, 0.28)}`,
    'wait': `<circle cx="16" cy="16" r="11.5" fill="none" stroke="{dark}" stroke-width="2.4" stroke-dasharray="14 8" stroke-linecap="round"/>${ghost(16, 17, 0.62)}`,
    'help': `<circle cx="16" cy="16" r="12" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M12.5 12 C12.5 9.5 14 8 16 8 C18.2 8 19.5 9.7 19.5 11.5 C19.5 13.6 17.8 14.6 16.3 15.4 C15.2 16 14.8 16.8 14.8 18" fill="none" stroke="{dark}" stroke-width="2.2" stroke-linecap="round"/><circle cx="14.8" cy="21.5" r="1.6" fill="{dark}"/>${ghost(24, 5, 0.28)}`,
    'not-allowed': `<circle cx="16" cy="16" r="12" fill="none" stroke="#D32F2F" stroke-width="2.6"/><path d="M8.5 8.5 L23.5 23.5" stroke="#D32F2F" stroke-width="2.6" stroke-linecap="round"/>${ghost(16, 17, 0.55)}`,
    'grab': `${ghost(9, 13, 0.5)}${ghost(23, 13, 0.5)}<path d="M8 20 Q11 23 16 23 Q21 23 24 20" stroke="{dark}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
    'grabbing': `${ghost(16, 11, 0.75)}<path d="M9 17 Q8.5 13 12.5 12.5 Q17 12 20.5 14 Q24 16 24 19 L24 21 L9 21 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>`,
    'progress': `<path d="M5.5 24.5 A11.5 11.5 0 0 1 26.5 24.5" fill="none" stroke="{dark}" stroke-width="2.6" stroke-linecap="round"/>${ghost(16, 10, 0.58)}<circle cx="26.5" cy="24.5" r="2" fill="{accent}" stroke="{dark}" stroke-width="1"/>`,
    'cell': `<rect x="6" y="6" width="20" height="20" rx="5" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M6 16 L26 16 M16 6 L16 26" stroke="{dark}" stroke-width="1.6"/>${ghost(16, 16, 0.4)}`,
    'copy': `<rect x="5" y="5" width="15" height="15" rx="4" fill="#E6E6F5" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="12" width="15" height="15" rx="4" fill="${G}" stroke="{dark}" stroke-width="1.3"/>${ghost(19, 19, 0.3)}`,
    'move': `<path d="M16 2.5 L20 9 L12 9 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29.5 L20 23 L12 23 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M2.5 16 L9 12 L9 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29.5 16 L23 12 L23 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${ghost(16, 16, 0.4)}`,
    'resize-ew': `<path d="M3 16 L10 10.5 L10 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29 16 L22 10.5 L22 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${ghost(16, 16, 0.36)}`,
    'resize-ns': `<path d="M16 3 L10.5 10 L21.5 10 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29 L10.5 22 L21.5 22 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>${ghost(16, 16, 0.36)}`,
  },
}

// =====================================================================
// 11. 高可见放大 Hi-Vis XL — 48px, thick strokes, high contrast
// =====================================================================

export const HIVIS = {
  id: 'hivis', name: '高可见放大 Hi-Vis XL', description: '48px 放大 · 高对比',
  palette: { primary: '#FFD400', accent: '#FFFFFF', dark: '#000000' },
  size: 48,
  art: {
    'default': `<path d="M6 4.5 L29 19 L20 21 L25.5 33 L20.5 34.5 L15 22.5 L9 26.5 Z" fill="${G}" stroke="{dark}" stroke-width="2.2" stroke-linejoin="round"/>`,
    'pointer': `<path d="M10 23 L10 13.5 C10 11.4 12 10.2 13.5 11.4 L14.1 11.9 L14.1 9 C14.1 6.9 16.1 5.7 17.6 6.9 L18.2 7.4 L18.2 5.4 C18.2 3.3 20.2 2.1 21.7 3.3 L22.5 3.6 L22.5 15.8 C27 17.3 30.8 21 31.5 26.3 C32.5 32.3 27.8 36.8 21.8 37.3 C16.5 37.8 11.3 31.5 10 23 Z" fill="${G}" stroke="{dark}" stroke-width="2" stroke-linejoin="round"/>`,
    'text': `<rect x="18" y="4.5" width="12" height="4.8" rx="2.4" fill="${G}" stroke="{dark}" stroke-width="2"/><rect x="18" y="38.7" width="12" height="4.8" rx="2.4" fill="${G}" stroke="{dark}" stroke-width="2"/><rect x="22.3" y="7.5" width="3.4" height="33" rx="1.7" fill="${G}" stroke="{dark}" stroke-width="1.6"/>`,
    'wait': `<circle cx="24" cy="24" r="17" fill="none" stroke="{dark}" stroke-width="3.6" stroke-dasharray="21 12" stroke-linecap="round"/><circle cx="24" cy="24" r="7" fill="${G}" stroke="{dark}" stroke-width="2"/>`,
    'help': `<circle cx="24" cy="24" r="18" fill="${G}" stroke="{dark}" stroke-width="2.4"/><path d="M18.8 18 C18.8 14.3 21 12 24 12 C27.3 12 29.3 14.6 29.3 17.3 C29.3 20.4 26.7 21.9 24.5 23.1 C22.8 23.9 22.2 25 22.2 27" fill="none" stroke="{dark}" stroke-width="3.3" stroke-linecap="round"/><circle cx="22.2" cy="32.3" r="2.4" fill="{dark}"/>`,
    'not-allowed': `<circle cx="24" cy="24" r="18" fill="none" stroke="#D32F2F" stroke-width="4"/><path d="M12.7 12.7 L35.3 35.3" stroke="#D32F2F" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="24" r="6.5" fill="${G}" stroke="{dark}" stroke-width="1.8"/>`,
    'grab': `<ellipse cx="24" cy="28.5" rx="13.5" ry="11" fill="${G}" stroke="{dark}" stroke-width="2.2"/><ellipse cx="12.5" cy="14.5" rx="3.9" ry="6" fill="${G}" stroke="{dark}" stroke-width="1.8"/><ellipse cx="20.5" cy="11" rx="3.9" ry="6.6" fill="${G}" stroke="{dark}" stroke-width="1.8"/><ellipse cx="28.5" cy="12" rx="3.9" ry="6.2" fill="${G}" stroke="{dark}" stroke-width="1.8"/><ellipse cx="35.5" cy="17" rx="3.6" ry="5.4" fill="${G}" stroke="{dark}" stroke-width="1.8"/><ellipse cx="24" cy="31" rx="4.2" ry="3" fill="{accent}"/>`,
    'grabbing': `<ellipse cx="24" cy="27" rx="15" ry="12.5" fill="${G}" stroke="{dark}" stroke-width="2.2"/><path d="M12.5 18.5 Q12 12 18 11 Q24 10 28.5 12.5 Q34 15 34 21 L34 24 L12.5 24 Z" fill="${G}" stroke="{dark}" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="24" cy="30.5" rx="4" ry="3" fill="{accent}"/>`,
    'progress': `<path d="M8.5 36.5 A17.5 17.5 0 0 1 39.5 36.5" fill="none" stroke="{dark}" stroke-width="4" stroke-linecap="round"/><circle cx="8.5" cy="36.5" r="3.2" fill="{accent}" stroke="{dark}" stroke-width="1.6"/><circle cx="24" cy="18" r="8" fill="${G}" stroke="{dark}" stroke-width="2"/>`,
    'cell': `<rect x="9" y="9" width="30" height="30" rx="7.5" fill="${G}" stroke="{dark}" stroke-width="2.4"/><path d="M9 24 L39 24 M24 9 L24 39" stroke="{dark}" stroke-width="2.4"/>`,
    'copy': `<rect x="7.5" y="7.5" width="22.5" height="22.5" rx="6" fill="#E8E000" stroke="{dark}" stroke-width="2"/><rect x="18" y="18" width="22.5" height="22.5" rx="6" fill="${G}" stroke="{dark}" stroke-width="2"/>`,
    'move': `<path d="M24 3.5 L30 13.5 L18 13.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.8" stroke-linejoin="round"/><path d="M24 44.5 L30 34.5 L18 34.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.8" stroke-linejoin="round"/><path d="M3.5 24 L13.5 18 L13.5 30 Z" fill="${G}" stroke="{dark}" stroke-width="1.8" stroke-linejoin="round"/><path d="M44.5 24 L34.5 18 L34.5 30 Z" fill="${G}" stroke="{dark}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="24" cy="24" r="4.5" fill="{accent}" stroke="{dark}" stroke-width="1.6"/>`,
    'resize-ew': `<path d="M4.5 24 L15 16 L15 32 Z" fill="${G}" stroke="{dark}" stroke-width="1.8" stroke-linejoin="round"/><path d="M43.5 24 L33 16 L33 32 Z" fill="${G}" stroke="{dark}" stroke-width="1.8" stroke-linejoin="round"/><rect x="15" y="22" width="18" height="4" rx="2" fill="{accent}" stroke="{dark}" stroke-width="1.6"/>`,
    'resize-ns': `<path d="M24 4.5 L16 15 L32 15 Z" fill="${G}" stroke="{dark}" stroke-width="1.8" stroke-linejoin="round"/><path d="M24 43.5 L16 33 L32 33 Z" fill="${G}" stroke="{dark}" stroke-width="1.8" stroke-linejoin="round"/><rect x="22" y="15" width="4" height="18" rx="2" fill="{accent}" stroke="{dark}" stroke-width="1.6"/>`,
  },
}

// =====================================================================
// 12. 波普圆点 Pop — Matisse-style dotted border
// =====================================================================

export const POP = {
  id: 'pop', name: '波普圆点 Pop', description: '马蒂斯波普 · 圆点边框',
  palette: { primary: '#FF6B9D', accent: '#7B68EE', dark: '#2E2A4A' },
  decor: 'dots',
  art: {
    'default': `<path d="M4 3 L19.5 12.5 L13.6 13.5 L16.7 21 L13.6 22.1 L10.6 15 L5.8 17.3 Z" fill="${G}" stroke="{dark}" stroke-width="1.4" stroke-linejoin="round"/>`,
    'pointer': `<path d="M6.5 15.5 L6.5 9 C6.5 7.6 7.8 6.8 9 7.6 L9.4 7.9 L9.4 6 C9.4 4.6 10.7 3.8 11.9 4.6 L12.3 4.9 L12.3 3.6 C12.3 2.2 13.6 1.4 14.8 2.2 L15 2.4 L15 10.5 C18 11.5 20.5 14 21 17.5 C21.5 21.5 18.5 24.5 14.5 24.8 C11 25 7.5 21 6.5 15.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.3" stroke-linejoin="round"/>`,
    'text': `<rect x="12" y="3" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="25.8" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="14.9" y="5" width="2.2" height="22" rx="1.1" fill="${G}" stroke="{dark}" stroke-width="1.1"/>`,
    'wait': `<circle cx="16" cy="16" r="11.5" fill="none" stroke="{dark}" stroke-width="2.4" stroke-dasharray="14 8" stroke-linecap="round"/><circle cx="16" cy="16" r="5" fill="${G}" stroke="{dark}" stroke-width="1.3"/>`,
    'help': `<circle cx="16" cy="16" r="12" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M12.5 12 C12.5 9.5 14 8 16 8 C18.2 8 19.5 9.7 19.5 11.5 C19.5 13.6 17.8 14.6 16.3 15.4 C15.2 16 14.8 16.8 14.8 18" fill="none" stroke="{dark}" stroke-width="2.2" stroke-linecap="round"/><circle cx="14.8" cy="21.5" r="1.6" fill="{dark}"/>`,
    'not-allowed': `<circle cx="16" cy="16" r="12" fill="none" stroke="#D32F2F" stroke-width="2.6"/><path d="M8.5 8.5 L23.5 23.5" stroke="#D32F2F" stroke-width="2.6" stroke-linecap="round"/>`,
    'grab': `<ellipse cx="16" cy="18" rx="9" ry="8" fill="${G}" stroke="{dark}" stroke-width="1.4"/><ellipse cx="9.5" cy="9.5" rx="2.5" ry="3.8" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="15" cy="7.5" rx="2.5" ry="4.2" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="20.5" cy="8.5" rx="2.5" ry="4" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="25" cy="11.5" rx="2.3" ry="3.4" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="16" cy="20.5" rx="2.8" ry="2.2" fill="{accent}"/>`,
    'grabbing': `<ellipse cx="16" cy="17" rx="10" ry="8.5" fill="${G}" stroke="{dark}" stroke-width="1.4"/><path d="M8.5 12 Q8 7.5 12 7 Q16 6.5 19 8 Q22.5 9.5 22.5 13 L22.5 15.5 L8.5 15.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>`,
    'progress': `<path d="M5.5 24.5 A11.5 11.5 0 0 1 26.5 24.5" fill="none" stroke="{dark}" stroke-width="2.6" stroke-linecap="round"/><circle cx="26.5" cy="24.5" r="2" fill="{accent}" stroke="{dark}" stroke-width="1"/><circle cx="16" cy="12" r="5.5" fill="${G}" stroke="{dark}" stroke-width="1.3"/>`,
    'cell': `<rect x="6" y="6" width="20" height="20" rx="5" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M6 16 L26 16 M16 6 L16 26" stroke="{dark}" stroke-width="1.6"/>`,
    'copy': `<rect x="5" y="5" width="15" height="15" rx="4" fill="#F0D8E4" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="12" width="15" height="15" rx="4" fill="${G}" stroke="{dark}" stroke-width="1.3"/>`,
    'move': `<path d="M16 2.5 L20 9 L12 9 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29.5 L20 23 L12 23 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M2.5 16 L9 12 L9 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29.5 16 L23 12 L23 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="16" cy="16" r="3" fill="{accent}" stroke="{dark}" stroke-width="1.1"/>`,
    'resize-ew': `<path d="M3 16 L10 10.5 L10 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29 16 L22 10.5 L22 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>`,
    'resize-ns': `<path d="M16 3 L10.5 10 L21.5 10 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29 L10.5 22 L21.5 22 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>`,
  },
}

const gloss = `<ellipse cx="20" cy="9.5" rx="5" ry="2.8" fill="#FFFFFF" opacity="0.8" transform="rotate(-30 20 9.5)"/><circle cx="10.5" cy="7" r="1.8" fill="#FFFFFF" opacity="0.9"/>`

export const CANDY = {
  id: 'candy', name: '糖果玻璃 Candy', description: '果冻质感 · 高光糖果',
  palette: { primary: '#FF9EB5', accent: '#C8F0FF', dark: '#B06A8A' },
  decor: 'gloss',
  art: {
    'default': `<path d="M4 3 L19.5 12.5 L13.6 13.5 L16.7 21 L13.6 22.1 L10.6 15 L5.8 17.3 Z" fill="${G}" stroke="{dark}" stroke-width="1.4" stroke-linejoin="round"/>`,
    'pointer': `<path d="M6.5 15.5 L6.5 9 C6.5 7.6 7.8 6.8 9 7.6 L9.4 7.9 L9.4 6 C9.4 4.6 10.7 3.8 11.9 4.6 L12.3 4.9 L12.3 3.6 C12.3 2.2 13.6 1.4 14.8 2.2 L15 2.4 L15 10.5 C18 11.5 20.5 14 21 17.5 C21.5 21.5 18.5 24.5 14.5 24.8 C11 25 7.5 21 6.5 15.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.3" stroke-linejoin="round"/>`,
    'text': `<rect x="12" y="3" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="25.8" width="8" height="3.2" rx="1.6" fill="${G}" stroke="{dark}" stroke-width="1.3"/><rect x="14.9" y="5" width="2.2" height="22" rx="1.1" fill="${G}" stroke="{dark}" stroke-width="1.1"/>`,
    'wait': `<circle cx="16" cy="16" r="11.5" fill="none" stroke="{dark}" stroke-width="2.4" stroke-dasharray="14 8" stroke-linecap="round"/><circle cx="16" cy="16" r="5.5" fill="${G}" stroke="{dark}" stroke-width="1.3"/>`,
    'help': `<circle cx="16" cy="16" r="12" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M12.5 12 C12.5 9.5 14 8 16 8 C18.2 8 19.5 9.7 19.5 11.5 C19.5 13.6 17.8 14.6 16.3 15.4 C15.2 16 14.8 16.8 14.8 18" fill="none" stroke="{dark}" stroke-width="2.2" stroke-linecap="round"/><circle cx="14.8" cy="21.5" r="1.6" fill="{dark}"/>`,
    'not-allowed': `<circle cx="16" cy="16" r="12" fill="none" stroke="#D32F2F" stroke-width="2.6"/><path d="M8.5 8.5 L23.5 23.5" stroke="#D32F2F" stroke-width="2.6" stroke-linecap="round"/>`,
    'grab': `<ellipse cx="16" cy="18" rx="9" ry="8" fill="${G}" stroke="{dark}" stroke-width="1.4"/><ellipse cx="9.5" cy="9.5" rx="2.5" ry="3.8" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="15" cy="7.5" rx="2.5" ry="4.2" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="20.5" cy="8.5" rx="2.5" ry="4" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="25" cy="11.5" rx="2.3" ry="3.4" fill="${G}" stroke="{dark}" stroke-width="1.2"/><ellipse cx="16" cy="20.5" rx="2.8" ry="2.2" fill="{accent}"/>`,
    'grabbing': `<ellipse cx="16" cy="17" rx="10" ry="8.5" fill="${G}" stroke="{dark}" stroke-width="1.4"/><path d="M8.5 12 Q8 7.5 12 7 Q16 6.5 19 8 Q22.5 9.5 22.5 13 L22.5 15.5 L8.5 15.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>`,
    'progress': `<path d="M5.5 24.5 A11.5 11.5 0 0 1 26.5 24.5" fill="none" stroke="{dark}" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="13" r="5.5" fill="${G}" stroke="{dark}" stroke-width="1.3"/><circle cx="26.5" cy="24.5" r="2" fill="{accent}" stroke="{dark}" stroke-width="1"/>`,
    'cell': `<rect x="6" y="6" width="20" height="20" rx="5" fill="${G}" stroke="{dark}" stroke-width="1.6"/><path d="M6 16 L26 16 M16 6 L16 26" stroke="{dark}" stroke-width="1.6"/>`,
    'copy': `<rect x="5" y="5" width="15" height="15" rx="4" fill="#F5DCE4" stroke="{dark}" stroke-width="1.3"/><rect x="12" y="12" width="15" height="15" rx="4" fill="${G}" stroke="{dark}" stroke-width="1.3"/>`,
    'move': `<path d="M16 2.5 L20 9 L12 9 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29.5 L20 23 L12 23 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M2.5 16 L9 12 L9 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29.5 16 L23 12 L23 20 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="16" cy="16" r="3" fill="{accent}" stroke="{dark}" stroke-width="1.1"/>`,
    'resize-ew': `<path d="M3 16 L10 10.5 L10 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29 16 L22 10.5 L22 21.5 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>`,
    'resize-ns': `<path d="M16 3 L10.5 10 L21.5 10 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29 L10.5 22 L21.5 22 Z" fill="${G}" stroke="{dark}" stroke-width="1.2" stroke-linejoin="round"/>`,
  },
}


export const NEON = {
  id: 'neon', name: '霓虹夜城 Neon', description: '荧光描边 · 赛博光晕',
  palette: { primary: '#00E5FF', accent: '#FF2E88', dark: '#12081F' },
  decor: 'glow',
  art: {
    'default': `<path d="M4 3 L20 12.5 L13.8 13.6 L16.9 21.8 L13.6 22.9 L10.5 15.2 L5.6 17.6 Z" fill="{primary}" stroke="{accent}" stroke-width="1.6" stroke-linejoin="round"/>`,
    'pointer': `<path d="M6.5 15.5 L6.5 9 C6.5 7.6 7.8 6.8 9 7.6 L9.4 7.9 L9.4 6 C9.4 4.6 10.7 3.8 11.9 4.6 L12.3 4.9 L12.3 3.6 C12.3 2.2 13.6 1.4 14.8 2.2 L15 2.4 L15 10.5 C18 11.5 20.5 14 21 17.5 C21.5 21.5 18.5 24.5 14.5 24.8 C11 25 7.5 21 6.5 15.5 Z" fill="{primary}" stroke="{accent}" stroke-width="1.6" stroke-linejoin="round"/>`,
    'text': `<rect x="12" y="3" width="8" height="3.2" rx="1.6" fill="{primary}" stroke="{accent}" stroke-width="1.4"/><rect x="12" y="25.8" width="8" height="3.2" rx="1.6" fill="{primary}" stroke="{accent}" stroke-width="1.4"/><rect x="14.9" y="5" width="2.2" height="22" rx="1.1" fill="{primary}" stroke="{accent}" stroke-width="1.2"/>`,
    'wait': `<circle cx="16" cy="16" r="11.5" fill="none" stroke="{primary}" stroke-width="2.6" stroke-dasharray="14 8" stroke-linecap="round"/><circle cx="16" cy="16" r="4.5" fill="{primary}"/>`,
    'help': `<circle cx="16" cy="16" r="12" fill="none" stroke="{primary}" stroke-width="1.8"/><path d="M12.5 12 C12.5 9.5 14 8 16 8 C18.2 8 19.5 9.7 19.5 11.5 C19.5 13.6 17.8 14.6 16.3 15.4 C15.2 16 14.8 16.8 14.8 18" fill="none" stroke="{accent}" stroke-width="2.4" stroke-linecap="round"/><circle cx="14.8" cy="21.5" r="1.7" fill="{accent}"/>`,
    'not-allowed': `<circle cx="16" cy="16" r="12" fill="none" stroke="{accent}" stroke-width="2.6"/><path d="M8.5 8.5 L23.5 23.5" stroke="{accent}" stroke-width="2.6" stroke-linecap="round"/>`,
    'grab': `<ellipse cx="16" cy="17" rx="9" ry="7.5" fill="none" stroke="{primary}" stroke-width="1.8"/><ellipse cx="9.5" cy="8.5" rx="2.4" ry="3.6" fill="{primary}"/><ellipse cx="15.5" cy="6.5" rx="2.4" ry="3.8" fill="{primary}"/><ellipse cx="21.5" cy="8" rx="2.4" ry="3.5" fill="{primary}"/>`,
    'grabbing': `<ellipse cx="16" cy="17" rx="9.5" ry="8" fill="none" stroke="{primary}" stroke-width="1.8"/><path d="M9 12 Q8.5 7.5 13 7 Q17 6.5 20 8.5 Q23 10.5 23 14 L23 16 L9 16 Z" fill="none" stroke="{accent}" stroke-width="1.8" stroke-linejoin="round"/>`,
    'progress': `<path d="M5.5 24.5 A11.5 11.5 0 0 1 26.5 24.5" fill="none" stroke="{primary}" stroke-width="2.6" stroke-linecap="round"/><circle cx="26.5" cy="24.5" r="2.2" fill="{accent}"/>`,
    'cell': `<rect x="6" y="6" width="20" height="20" rx="5" fill="none" stroke="{primary}" stroke-width="1.8"/><path d="M6 16 L26 16 M16 6 L16 26" stroke="{accent}" stroke-width="1.4"/>`,
    'copy': `<rect x="5" y="5" width="15" height="15" rx="4" fill="none" stroke="{primary}" stroke-width="1.5"/><rect x="12" y="12" width="15" height="15" rx="4" fill="none" stroke="{accent}" stroke-width="1.5"/>`,
    'move': `<path d="M16 2.5 L20 9 L12 9 Z" fill="{primary}"/><path d="M16 29.5 L20 23 L12 23 Z" fill="{primary}"/><path d="M2.5 16 L9 12 L9 20 Z" fill="{primary}"/><path d="M29.5 16 L23 12 L23 20 Z" fill="{primary}"/><circle cx="16" cy="16" r="3.2" fill="{accent}"/>`,
    'resize-ew': `<path d="M3 16 L10 10.5 L10 21.5 Z" fill="{primary}"/><path d="M29 16 L22 10.5 L22 21.5 Z" fill="{primary}"/><rect x="10" y="14.6" width="12" height="2.8" rx="1.4" fill="{accent}"/>`,
    'resize-ns': `<path d="M16 3 L10.5 10 L21.5 10 Z" fill="{primary}"/><path d="M16 29 L10.5 22 L21.5 22 Z" fill="{primary}"/><rect x="14.6" y="10" width="2.8" height="12" rx="1.4" fill="{accent}"/>`,
  },
}

/** All creative themes, in display order. */
export const CREATIVE_THEMES = [PAW, ENERGY, NEON, EMOJI, PIXEL, WEATHER, ORIGAMI, ASTRO, CANDY, GHOST, HIVIS, POP]
