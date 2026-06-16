<script>
  import DiceTray from '../components/DiceTray.svelte'
  import { diceState } from '../state/dice.svelte.js'
</script>

<section>
  <DiceTray />
  <button class="roll" onclick={() => diceState.reroll()}>Roll</button>
</section>

<style>
  section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .roll {
    margin: auto 1rem 1.5rem;
    padding: 1rem;
    font-size: 1.25rem;
  }
</style>
