import { load, save } from '../lib/storage.js'
import { config } from './config.svelte.js'
import { builtinPresets } from '../lib/builtinPresets.js'

const KEY = 'dice-presets'

/**
 * Prefix for built-in preset runtime ids, keeping them in a separate namespace
 * from user preset ids (`pN`) so the two can never collide.
 */
const BUILTIN_PREFIX = 'builtin:'

let nextId = 0
const makeId = () => `p${nextId++}`

/**
 * Snapshot the current config dice into a plain, storable shape.
 * @returns {{ sides: number, color: string }[]}
 */
const snapshotDice = () => config.dice.map((d) => ({ sides: d.sides, color: d.color }))

/**
 * Validate a single die entry inside a persisted preset.
 * @param {any} d
 */
const isValidDie = (d) => d && Number.isInteger(d.sides) && d.sides >= 2

/**
 * Validate that an array looks like a list of persisted presets.
 * @param {any} list
 * @returns {boolean}
 */
const isValidPresetList = (list) =>
  Array.isArray(list) &&
  list.every(
    (p) =>
      p &&
      typeof p.name === 'string' &&
      Array.isArray(p.dice) &&
      p.dice.every(isValidDie),
  )

/**
 * Validate a persisted presets blob before trusting it.
 * @param {any} saved
 * @returns {boolean}
 */
function isValidBlob(saved) {
  return !!saved && typeof saved === 'object' && isValidPresetList(saved.userPresets)
}

/**
 * Build the runtime list of built-in presets. Built-ins are reconstructed from
 * source on every load and are never deletable.
 * @returns {{ id: string, name: string, builtin: true, dice: { sides: number, color: string }[] }[]}
 */
const builtins = () =>
  builtinPresets.map((b) => ({
    id: BUILTIN_PREFIX + b.key,
    name: b.name,
    builtin: /** @type {true} */ (true),
    dice: b.dice.map((d) => ({ sides: d.sides, color: d.color || '#ffffff' })),
  }))

/**
 * Named game presets. Combines built-in presets (shipped with the app, never
 * deletable) with the user's saved presets. Built-ins are reconstructed from
 * source each load; user presets are persisted in full. `activeId` tracks the
 * currently selected preset; `null` means a one-off "Custom" configuration.
 * Persisted to localStorage under its own key, separate from the live config.
 */
class Presets {
  /** @type {{ id: string, name: string, dice: { sides: number, color: string }[] }[]} */
  userPresets = $state([])

  /** @type {string | null} */
  activeId = $state(null)

  /**
   * Snapshot of the last one-off "Custom" dice setup, remembered so the user
   * can switch to a preset and back without losing their custom config.
   * Empty until the user has been in Custom mode at least once. Persisted.
   * @type {{ sides: number, color: string }[]}
   */
  customDice = $state([])

  constructor() {
    const saved = load(KEY)
    if (isValidBlob(saved)) {
      this.userPresets = saved.userPresets.map((/** @type {any} */ p) => ({
        id: typeof p.id === 'string' ? p.id : makeId(),
        name: p.name,
        dice: p.dice.map((/** @type {any} */ d) => ({ sides: d.sides, color: d.color || '#ffffff' })),
      }))
      // Resume the id counter past any persisted `pN` ids so new presets never
      // collide with restored ones.
      for (const p of this.userPresets) {
        const m = /^p(\d+)$/.exec(p.id)
        if (m) nextId = Math.max(nextId, Number(m[1]) + 1)
      }
      if (Array.isArray(saved.customDice) && saved.customDice.every(isValidDie)) {
        this.customDice = saved.customDice.map((/** @type {any} */ d) => ({
          sides: d.sides,
          color: d.color || '#ffffff',
        }))
      }
      // Restore the active selection if it still resolves to a real preset.
      // Ids are now stable across reloads, so this is a direct match.
      if (typeof saved.activeId === 'string' && this.presets.some((p) => p.id === saved.activeId)) {
        this.activeId = saved.activeId
      }
    }

    // Auto-persist on any change.
    $effect.root(() => {
      $effect(() => {
        save(
          {
            version: 2,
            activeId: this.activeId,
            customDice: this.customDice.map((d) => ({ sides: d.sides, color: d.color })),
            userPresets: this.userPresets.map((p) => ({
              id: p.id,
              name: p.name,
              dice: p.dice.map((d) => ({ sides: d.sides, color: d.color })),
            })),
          },
          KEY,
        )
      })
    })
  }

  /**
   * The full preset list shown to the user: saved presets first, then the
   * built-ins.
   * @returns {{ id: string, name: string, builtin?: boolean, dice: { sides: number, color: string }[] }[]}
   */
  get presets() {
    return [...this.userPresets, ...builtins()]
  }

  /** @returns {{ id: string, name: string, builtin?: boolean, dice: { sides: number, color: string }[] } | null} */
  get active() {
    return this.presets.find((p) => p.id === this.activeId) || null
  }

  /**
   * Load a preset into the live config and mark it active.
   * @param {string} id
   */
  select(id) {
    const preset = this.presets.find((p) => p.id === id)
    if (!preset) return
    // Leaving Custom: remember the current dice so we can restore them later.
    if (this.activeId === null) this.customDice = snapshotDice()
    config.replaceDice(preset.dice)
    this.activeId = id
  }

  /**
   * Switch to a one-off custom configuration. Restores the last remembered
   * Custom dice if there is a snapshot; otherwise keeps the current dice.
   */
  selectCustom() {
    if (this.customDice.length) config.replaceDice(this.customDice)
    this.activeId = null
  }

  /** Drop the active selection because the dice were edited. */
  markCustom() {
    this.activeId = null
  }

  /**
   * Save the current config dice as a new named preset and make it active.
   * @param {string} name
   */
  saveCurrentAs(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    const preset = { id: makeId(), name: trimmed, dice: snapshotDice() }
    this.userPresets.push(preset)
    this.activeId = preset.id
  }

  /**
   * Remove a user preset. Built-ins are not deletable and are ignored. If the
   * removed preset was active, fall back to Custom.
   * @param {string} id
   */
  remove(id) {
    if (id.startsWith(BUILTIN_PREFIX)) return
    this.userPresets = this.userPresets.filter((p) => p.id !== id)
    if (this.activeId === id) this.activeId = null
  }
}

export const presets = new Presets()
