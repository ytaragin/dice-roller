import { config } from './config.svelte.js'
import { rollDie } from '../lib/rng.js'

/**
 * The runtime dice shown on the roll screen.
 * Locks/used flags live only within a session and reset on rebuild.
 */
class DiceState {
  /** @type {{ id: string, sides: number, value: number, locked: boolean, used: boolean }[]} */
  dice = $state([])

  constructor() {
    this.rebuild()
  }

  /** Rebuild the dice from the current config (locks/used reset, fresh roll). */
  rebuild() {
    this.dice = config.dice.map((d) => ({
      id: d.id,
      sides: d.sides,
      value: rollDie(d.sides),
      locked: false,
      used: false,
    }))
  }

  /** Reroll every unlocked die; locked dice keep their value. */
  reroll() {
    for (const d of this.dice) {
      if (!d.locked) d.value = rollDie(d.sides)
    }
  }

  /** @param {string} id */
  toggleLock(id) {
    const d = this.dice.find((x) => x.id === id)
    if (d) d.locked = !d.locked
  }

  /** @param {string} id */
  toggleUsed(id) {
    const d = this.dice.find((x) => x.id === id)
    if (d) d.used = !d.used
  }
}

export const diceState = new DiceState()
