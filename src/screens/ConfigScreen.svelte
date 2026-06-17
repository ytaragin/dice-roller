<script>
  import DieConfigRow from '../components/DieConfigRow.svelte'
  import { config } from '../state/config.svelte.js'
  import { diceState } from '../state/dice.svelte.js'

  /** @param {string} id @param {number} sides */
  function setSides(id, sides) {
    config.setSides(id, sides)
    diceState.rebuild()
  }

  /** @param {string} id @param {string} color */
  function setColor(id, color) {
    config.setColor(id, color)
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
  {#each config.dice as die, i (die.id)}
    <DieConfigRow {die} index={i} onSetSides={setSides} onSetColor={setColor} onRemove={removeDie} />
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
</style>
