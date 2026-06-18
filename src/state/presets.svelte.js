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
 * Supports the current shape (`userPresets` + `hiddenBuiltins`) and the
 * legacy v1 shape (`presets`).
 * @param {any} saved
 * @returns {boolean}
 */
function isValidBlob(saved) {
  if (!saved || typeof saved !== 'object') return false
  if (Array.isArray(saved.userPresets)) return isValidPresetList(saved.userPresets)
  // Legacy v1 blob.
  return isValidPresetList(saved.presets)
}

/**
 * Build the runtime list of built-in presets, excluding any the user hid.
 * @param {string[]} hidden - keys of built-ins the user deleted
 * @returns {{ id: string, key: string, name: string, builtin: true, dice: { sides: number, color: string }[] }[]}
 */
const visibleBuiltins = (hidden) =>
  builtinPresets
    .filter((b) => !hidden.includes(b.key))
    .map((b) => ({
      id: BUILTIN_PREFIX + b.key,
      key: b.key,
      name: b.name,
      builtin: /** @type {true} */ (true),
      dice: b.dice.map((d) => ({ sides: d.sides, color: d.color || '#ffffff' })),
    }))

/**
 * Named game presets. Combines built-in presets (shipped with the app) with
 * the user's saved presets. Built-ins are reconstructed from source each load;
 * the only built-in state persisted is which ones the user has hidden
 * ("deleted"), so they can be restored. `activeId` tracks the currently
 * selected preset; `null` means a one-off "Custom" configuration.
 * Persisted to localStorage under its own key, separate from the live config.
 */
class Presets {
  /** @type {{ id: string, name: string, dice: { sides: number, color: string }[] }[]} */
  userPresets = $state([])

  /** Keys of built-in presets the user has deleted (hidden). @type {string[]} */
  hiddenBuiltins = $state([])

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
      // Current shape, or migrate legacy v1 (`presets` -> all user presets).
      /** @type {{ id?: string, name: string, dice: { sides: number, color: string }[] }[]} */
      const sourceList = Array.isArray(saved.userPresets)
        ? saved.userPresets
        : saved.presets
      this.userPresets = sourceList.map((p) => ({
        id: makeId(),
        name: p.name,
        dice: p.dice.map((d) => ({ sides: d.sides, color: d.color || '#ffffff' })),
      }))
      this.hiddenBuiltins = Array.isArray(saved.hiddenBuiltins)
        ? saved.hiddenBuiltins.filter((/** @type {any} */ k) => typeof k === 'string')
        : []
      if (Array.isArray(saved.customDice) && saved.customDice.every(isValidDie)) {
        this.customDice = saved.customDice.map((/** @type {any} */ d) => ({
          sides: d.sides,
          color: d.color || '#ffffff',
        }))
      }
      // Only restore the active selection if it still resolves to a real
      // preset. Built-in selections round-trip by their stable key; user
      // preset ids are regenerated, so match by index into the saved list.
      if (typeof saved.activeId === 'string') {
        const userIndex = sourceList.findIndex((p) => p.id === saved.activeId)
        if (userIndex >= 0) {
          this.activeId = this.userPresets[userIndex].id
        } else if (this.presets.some((p) => p.id === saved.activeId)) {
          this.activeId = saved.activeId
        }
      }
    }

    // Auto-persist on any change. User preset ids are stable within a session
    // and are only used to round-trip the active selection across reloads.
    $effect.root(() => {
      $effect(() => {
        save(
          {
            version: 2,
            activeId: this.activeId,
            hiddenBuiltins: this.hiddenBuiltins,
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
   * visible (non-hidden) built-ins.
   * @returns {{ id: string, key?: string, name: string, builtin?: boolean, dice: { sides: number, color: string }[] }[]}
   */
  get presets() {
    return [...this.userPresets, ...visibleBuiltins(this.hiddenBuiltins)]
  }

  /** Whether any built-in preset is currently hidden (so it can be restored). */
  get hasHiddenBuiltins() {
    return this.hiddenBuiltins.length > 0
  }

  /** @returns {{ id: string, name: string, dice: { sides: number, color: string }[] } | null} */
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
   * Remove a preset. Built-ins are hidden (and can be restored) rather than
   * truly deleted; user presets are removed outright. The id's namespace
   * (`builtin:` prefix) determines which kind it is. If it was active, fall
   * back to Custom.
   * @param {string} id
   */
  remove(id) {
    if (id.startsWith(BUILTIN_PREFIX)) {
      const key = id.slice(BUILTIN_PREFIX.length)
      if (!this.hiddenBuiltins.includes(key)) this.hiddenBuiltins.push(key)
    } else {
      this.userPresets = this.userPresets.filter((p) => p.id !== id)
    }
    if (this.activeId === id) this.activeId = null
  }

  /** Restore all hidden built-in presets. */
  restoreBuiltins() {
    this.hiddenBuiltins = []
  }
}

export const presets = new Presets()
