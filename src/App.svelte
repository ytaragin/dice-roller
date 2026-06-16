<script>
  // App entry point - dice simulator skeleton
</script>

<main>
  <h1>Hello</h1>
</main>

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

  main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }
</style>
