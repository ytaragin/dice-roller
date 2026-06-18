<script>
  /**
   * @typedef {Object} Props
   * @property {(id: string) => void} onSelect - load a saved preset by id
   * @property {() => void} onSelectCustom - switch to a one-off custom config
   * @property {(name: string) => void} onSave - save current dice as a named preset
   * @property {(id: string) => void} onDelete - delete a preset by id
   */

  import { presets } from '../state/presets.svelte.js'

  /** @type {Props} */
  let { onSelect, onSelectCustom, onSave, onDelete } = $props()

  let saving = $state(false)
  let name = $state('')

  /** @param {Event} e */
  function handleChange(e) {
    const value = /** @type {HTMLSelectElement} */ (e.currentTarget).value
    if (value === '') onSelectCustom()
    else onSelect(value)
  }

  function startSave() {
    name = ''
    saving = true
  }

  function cancelSave() {
    saving = false
    name = ''
  }

  function confirmSave() {
    if (!name.trim()) return
    onSave(name)
    saving = false
    name = ''
  }
</script>

<div class="bar">
  <select value={presets.activeId ?? ''} onchange={handleChange}>
    <option value="">Custom</option>
    {#each presets.presets as preset (preset.id)}
      <option value={preset.id}>{preset.name}</option>
    {/each}
  </select>

  {#if presets.active && !presets.active.builtin}
    <button class="action" onclick={() => onDelete(presets.active.id)}>Delete</button>
  {:else if !presets.activeId && !saving}
    <button class="action" onclick={startSave}>Save as preset</button>
  {/if}
</div>

{#if saving}
  <div class="save-row">
    <input
      type="text"
      placeholder="Preset name"
      bind:value={name}
      onkeydown={(e) => {
        if (e.key === 'Enter') confirmSave()
        else if (e.key === 'Escape') cancelSave()
      }}
    />
    <button class="action" disabled={!name.trim()} onclick={confirmSave}>Save</button>
    <button class="action" onclick={cancelSave}>Cancel</button>
  </div>
{/if}

<style>
  .bar,
  .save-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
  }
  select,
  input[type='text'] {
    flex: 1;
    min-width: 0;
    padding: 0.4rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid #44446a;
    background: #16213e;
    color: inherit;
    font-size: 1rem;
  }
  .action {
    padding: 0.4rem 0.75rem;
    border: none;
    border-radius: 0.25rem;
    background: #0f3460;
    color: inherit;
    cursor: pointer;
    white-space: nowrap;
  }
  .action:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
