<script>
  /**
   * @typedef {Object} Props
   * @property {string} title
   * @property {string} action - label for the action button
   * @property {() => void} onAction
   */

  /** @type {Props} */
  let { title, action, onAction } = $props()
</script>

<header>
  <h1>{title}</h1>
  <button onclick={onAction}>{action}</button>
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
</style>
