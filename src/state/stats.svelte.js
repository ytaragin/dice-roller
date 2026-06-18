import { load, save } from '../lib/storage.js'

const KEY = 'dice-stats'

/**
 * Validate a persisted stats blob before trusting it. `bySize` maps a stringly
 * dice-size key to an array of per-face counts (index `value - 1`).
 * @param {any} saved
 * @returns {boolean}
 */
function isValidBlob(saved) {
  if (!saved || typeof saved !== 'object' || !saved.bySize || typeof saved.bySize !== 'object') {
    return false
  }
  return Object.entries(saved.bySize).every(([sides, counts]) => {
    const n = Number(sides)
    return (
      Number.isInteger(n) &&
      n >= 2 &&
      Array.isArray(counts) &&
      counts.length === n &&
      counts.every((c) => Number.isInteger(c) && c >= 0)
    )
  })
}

/**
 * Roll statistics, tracked per dice size. For each size we keep an array of
 * per-face counts (index `value - 1`), from which totals, averages and the
 * distribution chart are all derived. Only explicit Roll/Reroll presses are
 * recorded (see `diceState.reroll`); config rebuilds are not counted.
 * Persisted to localStorage under its own key, separate from config/presets.
 */
class Stats {
  /** @type {Record<number, number[]>} */
  bySize = $state({})

  constructor() {
    const saved = load(KEY)
    if (isValidBlob(saved)) {
      /** @type {Record<number, number[]>} */
      const restored = {}
      for (const [sides, counts] of Object.entries(saved.bySize)) {
        restored[Number(sides)] = /** @type {number[]} */ (counts).slice()
      }
      this.bySize = restored
    }

    // Auto-persist on any change.
    $effect.root(() => {
      $effect(() => {
        save({ version: 1, bySize: this.bySize }, KEY)
      })
    })
  }

  /**
   * Record a single rolled face for a given dice size.
   * @param {number} sides
   * @param {number} value
   */
  record(sides, value) {
    if (!Number.isInteger(sides) || sides < 2) return
    if (!Number.isInteger(value) || value < 1 || value > sides) return
    let counts = this.bySize[sides]
    if (!counts || counts.length !== sides) {
      counts = new Array(sides).fill(0)
      this.bySize[sides] = counts
    }
    counts[value - 1] += 1
  }

  /** Clear all recorded statistics. */
  reset() {
    this.bySize = {}
  }

  /**
   * Dice sizes that have recorded rolls, ascending.
   * @returns {number[]}
   */
  get sizes() {
    return Object.keys(this.bySize)
      .map(Number)
      .filter((sides) => this.totalFor(sides) > 0)
      .sort((a, b) => a - b)
  }

  /** True when nothing has been recorded yet. */
  get isEmpty() {
    return this.sizes.length === 0
  }

  /**
   * Per-face counts for a size (index `value - 1`).
   * @param {number} sides
   * @returns {number[]}
   */
  countsFor(sides) {
    return this.bySize[sides] ?? new Array(sides).fill(0)
  }

  /**
   * Total number of rolls recorded for a size.
   * @param {number} sides
   * @returns {number}
   */
  totalFor(sides) {
    const counts = this.bySize[sides]
    if (!counts) return 0
    return counts.reduce((sum, c) => sum + c, 0)
  }

  /**
   * Mean face value rolled for a size (0 when no rolls).
   * @param {number} sides
   * @returns {number}
   */
  averageFor(sides) {
    const counts = this.bySize[sides]
    if (!counts) return 0
    let total = 0
    let weighted = 0
    counts.forEach((c, i) => {
      total += c
      weighted += c * (i + 1)
    })
    return total === 0 ? 0 : weighted / total
  }

  /**
   * Highest single-face count for a size, used to scale the chart.
   * @param {number} sides
   * @returns {number}
   */
  maxCountFor(sides) {
    const counts = this.bySize[sides]
    if (!counts || counts.length === 0) return 0
    return Math.max(...counts)
  }
}

export const stats = new Stats()
