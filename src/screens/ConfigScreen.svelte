<script>
  import DieConfigRow from '../components/DieConfigRow.svelte'
  import PresetBar from '../components/PresetBar.svelte'
  import { config } from '../state/config.svelte.js'
  import { diceState } from '../state/dice.svelte.js'
  import { presets } from '../state/presets.svelte.js'

  /** @param {string} id @param {number} sides */
  function setSides(id, sides) {
    config.setSides(id, sides)
    presets.markCustom()
    diceState.rebuild()
  }

  /** @param {string} id @param {string} color */
  function setColor(id, color) {
    config.setColor(id, color)
    presets.markCustom()
  }

  /** @param {string} id */
  function removeDie(id) {
    config.removeDie(id)
    presets.markCustom()
    diceState.rebuild()
  }

  function addDie() {
    config.addDie()
    presets.markCustom()
    diceState.rebuild()
  }

  /** @param {string} id */
  function selectPreset(id) {
    presets.select(id)
    diceState.rebuild()
  }

  function selectCustom() {
    presets.selectCustom()
  }

  /** @param {string} name */
  function savePreset(name) {
    presets.saveCurrentAs(name)
  }

  /** @param {string} id */
  function deletePreset(id) {
    presets.remove(id)
  }
</script>

<section>
  <PresetBar
    onSelect={selectPreset}
    onSelectCustom={selectCustom}
    onSave={savePreset}
    onDelete={deletePreset}
  />

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
