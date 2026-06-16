/** Colors used when color-coding is enabled. */
export const palette = [
  '#e63946',
  '#f4a261',
  '#2a9d8f',
  '#457b9d',
  '#9b5de5',
  '#f15bb5',
]

/**
 * Pick a color for a die by its position.
 * @param {number} index
 * @returns {string}
 */
export function colorForIndex(index) {
  return palette[index % palette.length]
}
