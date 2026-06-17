<script>
  /**
   * @typedef {Object} Props
   * @property {{ id: string, sides: number, color: string }} die
   * @property {number} index
   * @property {(id: string, sides: number) => void} onSetSides
   * @property {(id: string, color: string) => void} onSetColor
   * @property {(id: string) => void} onRemove
   */

  /** @type {Props} */
  let { die, index, onSetSides, onSetColor, onRemove } = $props()
</script>

<div class="row">
  <span>Die {index + 1}</span>
  <input
    type="number"
    min="2"
    value={die.sides}
    oninput={(e) => onSetSides(die.id, Number(e.currentTarget.value))}
  />
  <input
    type="color"
    value={die.color}
    oninput={(e) => onSetColor(die.id, e.currentTarget.value)}
  />
  <button onclick={() => onRemove(die.id)}>✕</button>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 1rem;
  }
  input[type='number'] {
    width: 4rem;
  }
  input[type='color'] {
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    background: none;
  }
</style>
