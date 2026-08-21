/**
 * dsh-cursor-theme AI generation workflow (M4).
 *
 * Two pieces:
 *  1. buildAiPrompt(description) — turns the user's free-text idea into a
 *     structured prompt that asks the DSH assistant to reply with a JSON
 *     theme: { name, states: { <stateId>: { shape, color } } }.
 *  2. parseGeneratedTheme(json) — validates that reply and maps each state
 *     through the shared shape library so the caller can render it into a
 *     real cursor asset (render.ts) and write the settings.
 *
 * Shape ids and state ids are enumerated so the assistant cannot invent
 * unknown values; validation fails closed (requirements.md §4.8).
 */

import { PIXEL_SHAPES, SHAPE_BY_ID } from './shapes.js'
import { CURSOR_STATES } from './states.js'

export interface GeneratedState {
  shape: string
  color: string
}

export interface GeneratedTheme {
  name: string
  states: Record<string, GeneratedState>
}

const SHAPE_IDS = PIXEL_SHAPES.map((s) => s.id).sort()
const STATE_IDS = CURSOR_STATES.map((s) => s.id).sort()

/**
 * Build the structured prompt for the assistant.
 * @param description - the user's theme idea (free text).
 * @returns the prompt to copy / send to the current session.
 */
export function buildAiPrompt(description: string): string {
  const d = description.trim() || 'a fun pixel-art cursor theme'
  return [
    'You are designing a cursor theme for the dsh-cursor-theme plugin in DeepSeek Harness.',
    '',
    `User's idea: "${d}"`,
    '',
    'Reply with ONLY a JSON object (no markdown fences, no commentary) with this exact shape:',
    '{',
    '  "name": "<theme name, short and catchy>",',
    '  "states": {',
    '    "<stateId>": { "shape": "<shapeId>", "color": "#rrggbb" },',
    '    ...',
    '  }',
    '}',
    '',
    `Choose shapes ONLY from: ${SHAPE_IDS.join(', ')}.`,
    `You may set colors as any #rrggbb value; use a palette that fits the theme idea (same palette across states, with a darker "not-allowed" or "wait" accent where it helps).`,
    `Cover as many of these states as fit the theme (all optional): ${STATE_IDS.join(', ')}.`,
    '',
    'Example:',
    '{"name":"Coral Cat","states":{"pointer":{"shape":"cat","color":"#ff8fab"},"text":{"shape":"ibeam","color":"#ffb3c6"},"wait":{"shape":"bee","color":"#ffc2d1"},"not-allowed":{"shape":"ban","color":"#8d99ae"}}}',
  ].join('\n')
}

/**
 * Validate an assistant reply into a GeneratedTheme. Throws a readable
 * Error on malformed/invalid input (fail closed — current config untouched).
 */
export function parseGeneratedTheme(text: string): GeneratedTheme {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('The assistant reply is not valid JSON — ask it to reply with JSON only.')
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('Theme reply must be a JSON object.')
  const obj = raw as Partial<GeneratedTheme>
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0 || obj.name.length > 60) {
    throw new Error('Theme reply needs a short "name" string.')
  }
  if (typeof obj.states !== 'object' || obj.states === null || Array.isArray(obj.states)) {
    throw new Error('Theme reply needs a "states" object.')
  }
  const states: Record<string, GeneratedState> = {}
  for (const [stateId, cfg] of Object.entries(obj.states)) {
    if (!CURSOR_STATES.some((s) => s.id === stateId)) throw new Error(`Unknown state "${stateId}".`)
    if (typeof cfg !== 'object' || cfg === null) throw new Error(`State "${stateId}" must be an object.`)
    const c = cfg as Partial<GeneratedState>
    if (typeof c.shape !== 'string' || !SHAPE_BY_ID.has(c.shape)) {
      throw new Error(`State "${stateId}" has unknown shape "${String(c.shape)}" — choose from: ${SHAPE_IDS.join(', ')}.`)
    }
    if (typeof c.color !== 'string' || !/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(c.color.trim())) {
      throw new Error(`State "${stateId}" color must be a hex like #ff8fab.`)
    }
    states[stateId] = { shape: c.shape, color: c.color.trim() }
  }
  if (Object.keys(states).length === 0) throw new Error('Theme reply has no states.')
  return { name: obj.name.trim(), states }
}
