<script>
  import { stats } from '../state/stats.svelte.js'

  function resetStats() {
    if (confirm('Reset all dice statistics? This cannot be undone.')) {
      stats.reset()
    }
  }
</script>

<section>
  {#if stats.isEmpty}
    <p class="empty">No rolls recorded yet. Roll some dice to build up statistics.</p>
  {:else}
    {#each stats.sizes as sides (sides)}
      {@const counts = stats.countsFor(sides)}
      {@const max = stats.maxCountFor(sides)}
      <article class="die-stats">
        <header>
          <h2>d{sides}</h2>
          <span class="summary">
            {stats.totalFor(sides)} rolls &middot; avg {stats.averageFor(sides).toFixed(2)}
          </span>
        </header>
        <ul class="chart">
          {#each counts as count, i}
            <li>
              <span class="face">{i + 1}</span>
              <span class="bar-track">
                <span
                  class="bar"
                  style="width: {max > 0 ? (count / max) * 100 : 0}%"
                ></span>
              </span>
              <span class="count">{count}</span>
            </li>
          {/each}
        </ul>
      </article>
    {/each}
  {/if}

  <button class="reset" onclick={resetStats} disabled={stats.isEmpty}>Reset stats</button>
</section>

<style>
  section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    overflow-y: auto;
  }
  .empty {
    text-align: center;
    color: #a0a0c0;
    padding: 2rem 1rem;
  }
  .die-stats {
    background: #232342;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
  }
  .die-stats header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  h2 {
    font-size: 1.1rem;
  }
  .summary {
    font-size: 0.85rem;
    color: #a0a0c0;
  }
  .chart {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .chart li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
  }
  .face {
    width: 1.75rem;
    text-align: right;
    color: #a0a0c0;
    flex-shrink: 0;
  }
  .bar-track {
    flex: 1;
    height: 0.75rem;
    background: #1a1a2e;
    border-radius: 0.25rem;
    overflow: hidden;
  }
  .bar {
    display: block;
    height: 100%;
    background: #6c6cff;
    border-radius: 0.25rem;
  }
  .count {
    width: 2.5rem;
    text-align: right;
    color: #e0e0e0;
    flex-shrink: 0;
  }
  .reset {
    margin-top: auto;
    padding: 0.75rem;
  }
  .reset:disabled {
    opacity: 0.4;
  }
</style>
