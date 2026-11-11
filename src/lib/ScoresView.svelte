<script lang="ts">
  import type { Settings } from './game';
  import { boardLabel, clearScores, formatTime, loadScores } from './storage';

  let { settings, onback }: { settings: Settings; onback: () => void } = $props();

  let scores = $state(loadScores(settings));

  function clear() {
    if (confirm('Clear scores for these settings?')) {
      clearScores(settings);
      scores = [];
    }
  }
</script>

<div class="screen">
  <header>
    <h2>Scores</h2>
    {#if scores.length}
      <button type="button" class="clear" onclick={clear}>Clear</button>
    {/if}
  </header>
  <p class="label">{boardLabel(settings)}</p>

  <div class="screen-body">
    {#if scores.length}
      <ol>
        {#each scores as s, i (s.date)}
          <li>
            <span class="rank mono">{i + 1}</span>
            <span class="rounds mono">{s.rounds}</span>
            <span class="meta mono">
              {formatTime(s.time)} · {(s.time / Math.max(1, s.rounds)).toFixed(1)}s avg
            </span>
            <span class="date">{new Date(s.date).toLocaleDateString()}</span>
          </li>
        {/each}
      </ol>
    {:else}
      <p class="empty">No scores yet for these settings.</p>
    {/if}
  </div>

  <footer class="screen-footer">
    <button type="button" class="btn" onclick={onback}>Back</button>
  </footer>
</div>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }
  .clear {
    color: var(--muted);
    font-size: 15px;
  }
  .label {
    margin: 6px 0 12px;
    text-transform: none;
    letter-spacing: 0;
    font-size: 13px;
  }
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    display: grid;
    grid-template-columns: 24px 48px 1fr auto;
    align-items: baseline;
    gap: 8px;
    padding: 14px 0;
    border-bottom: 1px solid var(--faint);
  }
  .rank,
  .date,
  .meta {
    color: var(--muted);
    font-size: 13px;
  }
  .rounds {
    font-size: 20px;
    font-weight: 600;
  }
  .empty {
    color: var(--muted);
    text-align: center;
    margin-top: 25%;
  }
</style>
