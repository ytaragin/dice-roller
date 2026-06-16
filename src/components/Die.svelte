<script>
  /**
   * @typedef {Object} Props
   * @property {{ id: string, sides: number, value: number, locked: boolean, used: boolean }} die
   * @property {string} [color]
   * @property {(id: string) => void} onToggleLock
   * @property {(id: string) => void} onToggleUsed
   */

  /** @type {Props} */
  let { die, color, onToggleLock, onToggleUsed } = $props()
</script>

<div class="die" class:used={die.used} style:border-color={color}>
  <span class="value">{die.value}</span>
  <div class="actions">
    <button onclick={() => onToggleLock(die.id)}>
      {die.locked ? 'Locked' : 'Lock'}
    </button>
    <button onclick={() => onToggleUsed(die.id)}>Used</button>
  </div>
</div>

<style>
  .die {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 2px solid #444;
    border-radius: 0.5rem;
  }
  .used {
    opacity: 0.4;
  }
  .value {
    font-size: 1.75rem;
    font-weight: 700;
  }
  .actions {
    display: flex;
    gap: 0.25rem;
  }
</style>
