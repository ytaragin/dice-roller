let nextId = 0
const makeDie = (sides = 6) => ({ id: `d${nextId++}`, sides })

/**
 * App configuration: the set of dice to roll and display options.
 * Persisted to localStorage (TODO: wire up lib/storage.js).
 */
class Config {
  /** @type {{ id: string, sides: number }[]} */
  dice = $state([makeDie(), makeDie()])
  colorCoded = $state(true)

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
}

export const config = new Config()
