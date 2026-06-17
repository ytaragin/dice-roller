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

  const faceColor = $derived(color || '#ffffff')

  /**
   * Pick black or white for content on the face based on the face's
   * perceived brightness (WCAG relative luminance).
   * @param {string} hex
   */
  function contrastInk(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
    if (!m) return '#000000'
    const n = parseInt(m[1], 16)
    const toLin = (/** @type {number} */ c) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    const lum =
      0.2126 * toLin((n >> 16) & 0xff) +
      0.7152 * toLin((n >> 8) & 0xff) +
      0.0722 * toLin(n & 0xff)
    return lum > 0.4 ? '#15151f' : '#ffffff'
  }

  const ink = $derived(contrastInk(faceColor))
</script>

<div
  class="die"
  class:used={die.used}
  class:locked={die.locked}
  style:--face={faceColor}
  style:--ink={ink}
>
  <div class="face">
    <span class="label">d{die.sides}</span>
    {#if die.locked}
      <span class="lock" aria-hidden="true">🔒</span>
    {/if}
    <span class="value">{die.value}</span>
  </div>
  <div class="actions">
    <button class:active={die.locked} onclick={() => onToggleLock(die.id)}>
      {die.locked ? 'Locked' : 'Lock'}
    </button>
    <button class:active={die.used} onclick={() => onToggleUsed(die.id)}>Used</button>
  </div>
</div>

<style>
  .die {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .face {
    position: relative;
    width: 4.5rem;
    height: 4.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--face);
    color: var(--ink);
    border-radius: 0.9rem;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.25) inset,
      0 6px 14px rgba(0, 0, 0, 0.45);
    transition:
      box-shadow 0.15s ease,
      transform 0.1s ease;
  }

  .value {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .label {
    position: absolute;
    top: 0.35rem;
    left: 0.45rem;
    font-size: 0.7rem;
    font-weight: 600;
    opacity: 0.65;
    letter-spacing: 0.02em;
  }

  .lock {
    position: absolute;
    top: 0.3rem;
    right: 0.4rem;
    font-size: 0.75rem;
    line-height: 1;
  }

  .locked .face {
    box-shadow:
      0 0 0 2px #1a1a2e,
      0 0 0 4px var(--face),
      0 6px 14px rgba(0, 0, 0, 0.45);
  }

  .used .face {
    opacity: 0.35;
    filter: saturate(0.4);
  }

  .actions {
    display: flex;
    gap: 0.3rem;
  }

  .actions button {
    font-size: 0.75rem;
    font-weight: 600;
    color: #e0e0e0;
    background: #2a2a44;
    border: 1px solid #3a3a5a;
    border-radius: 999px;
    padding: 0.25rem 0.7rem;
    cursor: pointer;
    transition:
      background 0.12s ease,
      border-color 0.12s ease;
  }

  .actions button:hover {
    background: #34345a;
  }

  .actions button.active {
    background: #4a4a7a;
    border-color: #6a6aaa;
    color: #fff;
  }
</style>
