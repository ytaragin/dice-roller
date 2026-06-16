/**
 * Roll a single die.
 * @param {number} sides - number of faces
 * @returns {number} a value from 1..sides
 */
export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1
}
