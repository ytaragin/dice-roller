<script>
  import DiceTray from '../components/DiceTray.svelte'
  import { diceState } from '../state/dice.svelte.js'
  import { presets } from '../state/presets.svelte.js'
</script>

<section>
  <p class="preset-name">{presets.active?.name ?? 'Custom'}</p>
  <DiceTray />
  <button class="roll" onclick={() => diceState.reroll()}>Roll</button>
</section>

<style>
  section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .preset-name {
    text-align: center;
    font-size: 0.9rem;
    color: #a0a0c0;
    padding: 0.4rem 0;
  }
  .roll {
    margin: auto 1rem 1.5rem;
    padding: 1rem;
    font-size: 1.25rem;
  }
</style>
