<script>
  import NavBar from './components/NavBar.svelte'
  import RollScreen from './screens/RollScreen.svelte'
  import ConfigScreen from './screens/ConfigScreen.svelte'

  let screen = $state('roll') // 'roll' | 'config'
</script>

<NavBar
  title={screen === 'roll' ? 'Dice' : 'Settings'}
  action={screen === 'roll' ? 'Config' : 'Back'}
  onAction={() => (screen = screen === 'roll' ? 'config' : 'roll')}
/>

{#if screen === 'roll'}
  <RollScreen />
{:else}
  <ConfigScreen />
{/if}

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    background-color: #1a1a2e;
    color: #e0e0e0;
    font-family: system-ui, -apple-system, sans-serif;
    height: 100dvh;
    overflow: hidden;
  }

  :global(#app) {
    height: 100dvh;
    display: flex;
    flex-direction: column;
  }
</style>
