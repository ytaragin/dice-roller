<script>
  import NavBar from './components/NavBar.svelte'
  import RollScreen from './screens/RollScreen.svelte'
  import ConfigScreen from './screens/ConfigScreen.svelte'
  import StatsScreen from './screens/StatsScreen.svelte'

  let screen = $state('roll') // 'roll' | 'config' | 'stats'

  const titles = { roll: 'Dice', config: 'Settings', stats: 'Statistics' }

  const actions = $derived(
    screen === 'roll'
      ? [
          { label: 'Stats', onAction: () => (screen = 'stats') },
          { label: 'Config', onAction: () => (screen = 'config') },
        ]
      : [{ label: 'Back', onAction: () => (screen = 'roll') }],
  )
</script>

<NavBar title={titles[screen]} {actions} />

{#if screen === 'roll'}
  <RollScreen />
{:else if screen === 'config'}
  <ConfigScreen />
{:else}
  <StatsScreen />
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
