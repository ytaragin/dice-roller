import { load, save } from '../lib/storage.js'

let nextId = 0
const makeDie = (sides = 6, color = '#ffffff') => ({ id: `d${nextId++}`, sides, color })

/**
 * Validate a persisted config blob before trusting it.
 * An empty dice array is allowed (the user may have removed all dice).
 * @param {any} saved
 * @returns {boolean}
 */
function isValidConfig(saved) {
  return (
    !!saved &&
    typeof saved === 'object' &&
    Array.isArray(saved.dice) &&
    saved.dice.every((d) => d && Number.isInteger(d.sides) && d.sides >= 2)
  )
}

/**
 * App configuration: the set of dice to roll and display options.
 * Persisted to localStorage. Ids are runtime-only (for keyed `{#each}` and
 * targeting) and are intentionally NOT stored; they are regenerated on load.
 */
class Config {
  /** @type {{ id: string, sides: number, color: string }[]} */
  dice = $state([makeDie(), makeDie()])

  constructor() {
    const saved = load()
    if (isValidConfig(saved)) {
      this.dice = saved.dice.map((d) => makeDie(d.sides, d.color || '#ffffff'))
    }

    // Auto-persist on any change (sides edits, add/remove, color).
    // Ids are omitted from the stored shape on purpose.
    $effect.root(() => {
      $effect(() => {
        save({
          version: 2,
          dice: this.dice.map((d) => ({ sides: d.sides, color: d.color })),
        })
      })
    })
  }

  get diceCount() {
    return this.dice.length
  }

  /** @param {number} [sides] */
  addDie(sides = 6) {
    this.dice.push(makeDie(sides))
  }

  /** @param {string} id */
  removeDie(id) {
    this.dice = this.dice.filter((d) => d.id !== id)
  }

  /** @param {string} id @param {number} sides */
  setSides(id, sides) {
    const die = this.dice.find((d) => d.id === id)
    if (die) die.sides = sides
  }

  /** @param {string} id @param {string} color */
  setColor(id, color) {
    const die = this.dice.find((d) => d.id === id)
    if (die) die.color = color
  }
}

export const config = new Config()
