<script>
  /**
   * @typedef {Object} Action
   * @property {string} label - button text
   * @property {() => void} onAction
   *
   * @typedef {Object} Props
   * @property {string} title
   * @property {Action[]} actions - one or more header buttons (right-aligned)
   */

  /** @type {Props} */
  let { title, actions } = $props()
</script>

<header>
  <h1>{title}</h1>
  <nav>
    {#each actions as a}
      <button onclick={a.onAction}>{a.label}</button>
    {/each}
  </nav>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }
  h1 {
    font-size: 1.25rem;
  }
  nav {
    display: flex;
    gap: 0.5rem;
  }
</style>
