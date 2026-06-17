import { load, save } from '../lib/storage.js'
import { config } from './config.svelte.js'

const KEY = 'dice-presets'

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
 * Validate a persisted presets blob before trusting it.
 * @param {any} saved
 * @returns {boolean}
 */
function isValidBlob(saved) {
  return (
    !!saved &&
    typeof saved === 'object' &&
    Array.isArray(saved.presets) &&
    saved.presets.every(
      (p) =>
        p &&
        typeof p.name === 'string' &&
        Array.isArray(p.dice) &&
        p.dice.every(isValidDie),
    )
  )
}

/**
 * Named game presets. Each preset is a saved snapshot of the dice configuration.
 * `activeId` tracks the currently selected preset; `null` means a one-off
 * "Custom" configuration that is not tied to any saved preset.
 * Persisted to localStorage under its own key, separate from the live config.
 */
class Presets {
  /** @type {{ id: string, name: string, dice: { sides: number, color: string }[] }[]} */
  presets = $state([])

  /** @type {string | null} */
  activeId = $state(null)

  constructor() {
    const saved = load(KEY)
    if (isValidBlob(saved)) {
      this.presets = saved.presets.map((p) => ({
        id: makeId(),
        name: p.name,
        dice: p.dice.map((d) => ({ sides: d.sides, color: d.color || '#ffffff' })),
      }))
      // Only restore the active selection if it still resolves to a real preset.
      const restored = saved.presets.findIndex((p) => p.id === saved.activeId)
      this.activeId = restored >= 0 ? this.presets[restored].id : null
    }

    // Auto-persist on any change. Stored ids are stable within a session and
    // are only used to round-trip the active selection across reloads.
    $effect.root(() => {
      $effect(() => {
        save(
          {
            version: 1,
            activeId: this.activeId,
            presets: this.presets.map((p) => ({
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
    config.replaceDice(preset.dice)
    this.activeId = id
  }

  /** Switch to a one-off custom configuration, keeping the current dice. */
  selectCustom() {
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
    this.presets.push(preset)
    this.activeId = preset.id
  }

  /**
   * Remove a preset. If it was active, fall back to Custom.
   * @param {string} id
   */
  remove(id) {
    this.presets = this.presets.filter((p) => p.id !== id)
    if (this.activeId === id) this.activeId = null
  }
}

export const presets = new Presets()
