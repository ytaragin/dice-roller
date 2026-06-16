<script>
  import DieConfigRow from '../components/DieConfigRow.svelte'
  import { config } from '../state/config.svelte.js'
  import { diceState } from '../state/dice.svelte.js'

  /** @param {string} id @param {number} sides */
  function setSides(id, sides) {
    config.setSides(id, sides)
    diceState.rebuild()
  }

  /** @param {string} id */
  function removeDie(id) {
    config.removeDie(id)
    diceState.rebuild()
  }

  function addDie() {
    config.addDie()
    diceState.rebuild()
  }
</script>

<section>
  <label class="color-toggle">
    <input type="checkbox" bind:checked={config.colorCoded} />
    Color-code dice
  </label>

  {#each config.dice as die, i (die.id)}
    <DieConfigRow {die} index={i} onSetSides={setSides} onRemove={removeDie} />
  {/each}

  <button onclick={addDie}>+ Add die</button>
</section>

<style>
  section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }
  .color-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
