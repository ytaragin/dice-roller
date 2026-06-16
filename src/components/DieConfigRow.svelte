<script>
  /**
   * @typedef {Object} Props
   * @property {{ id: string, sides: number }} die
   * @property {number} index
   * @property {(id: string, sides: number) => void} onSetSides
   * @property {(id: string) => void} onRemove
   */

  /** @type {Props} */
  let { die, index, onSetSides, onRemove } = $props()
</script>

<div class="row">
  <span>Die {index + 1}</span>
  <input
    type="number"
    min="2"
    value={die.sides}
    oninput={(e) => onSetSides(die.id, Number(e.currentTarget.value))}
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
  input {
    width: 4rem;
  }
</style>
