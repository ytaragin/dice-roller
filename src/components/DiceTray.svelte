<script>
  import Die from './Die.svelte'
  import { diceState } from '../state/dice.svelte.js'
  import { config } from '../state/config.svelte.js'
  import { colorForIndex } from '../lib/colors.js'
</script>

<div class="tray">
  {#each diceState.dice as die, i (die.id)}
    <Die
      {die}
      color={config.colorCoded ? colorForIndex(i) : undefined}
      onToggleLock={(id) => diceState.toggleLock(id)}
      onToggleUsed={(id) => diceState.toggleUsed(id)}
    />
  {/each}
</div>

<style>
  .tray {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    padding: 1rem;
  }
</style>
