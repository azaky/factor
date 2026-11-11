<script lang="ts">
  import type { Settings } from './game';
  import { puzzleNumber, type ModeId } from './modes';
  import {
    classicBoard,
    classicLabel,
    clearScores,
    dailyStreak,
    formatTime,
    loadDaily,
    loadScores,
  } from './storage';

  let {
    settings,
    tab: initialTab,
    onback,
  }: { settings: Settings; tab: ModeId; onback: () => void } = $props();

  // svelte-ignore state_referenced_locally
  let tab = $state<ModeId>(initialTab);
  let version = $state(0);

  const tabs: { id: ModeId; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'blitz', label: 'Blitz' },
    { id: 'survival', label: 'Survival' },
    { id: 'classic', label: 'Classic' },
  ];

  let board = $derived(tab === 'classic' ? classicBoard(settings) : tab);
  let scores = $derived.by(() => {
    void version;
    return tab === 'daily' ? [] : loadScores(board);
  });

  let dailyLog = loadDaily();
  let daily = Object.entries(dailyLog)
    .filter(([, e]) => e.done)
    .sort((a, b) => a[1].time - b[1].time);
  let played = Object.keys(dailyLog).length;
  let streak = dailyStreak(dailyLog);

  let caption = $derived(
    tab === 'daily'
      ? 'Fastest days'
      : tab === 'blitz'
        ? 'Most solved in one run'
        : tab === 'survival'
          ? 'Highest level reached'
          : classicLabel(settings)
  );

  function clear() {
    if (confirm('Clear these scores?')) {
      clearScores(board);
      version++;
    }
  }

  function detail(rounds: number, time: number): string {
    if (tab === 'blitz') return `${time} missed`;
    return `${formatTime(time)} · ${(time / Math.max(1, rounds)).toFixed(1)}s avg`;
  }
</script>

<div class="screen">
  <header>
    <h2>Scores</h2>
    {#if scores.length}
      <button type="button" class="clear" onclick={clear}>Clear</button>
    {/if}
  </header>

  <div class="seg">
    {#each tabs as t (t.id)}
      <button type="button" class:on={tab === t.id} onclick={() => (tab = t.id)}>{t.label}</button>
    {/each}
  </div>
  <p class="caption">{caption}</p>

  <div class="screen-body">
    {#if tab === 'daily'}
      <div class="stats">
        <div><b class="mono">{streak}</b><span>streak</span></div>
        <div><b class="mono">{played}</b><span>played</span></div>
        <div><b class="mono">{daily.length}</b><span>finished</span></div>
      </div>
      {#if daily.length}
        <ol>
          {#each daily.slice(0, 10) as [day, e], i (day)}
            <li>
              <span class="rank mono">{i + 1}</span>
              <span class="main mono">{formatTime(e.time)}</span>
              <span class="meta">{e.misses} missed</span>
              <span class="date mono">#{puzzleNumber(day)}</span>
            </li>
          {/each}
        </ol>
      {:else}
        <p class="empty">No finished dailies yet.</p>
      {/if}
    {:else if scores.length}
      <ol>
        {#each scores as s, i (s.date)}
          <li>
            <span class="rank mono">{i + 1}</span>
            <span class="main mono">{s.rounds}</span>
            <span class="meta mono">{detail(s.rounds, s.time)}</span>
            <span class="date">{new Date(s.date).toLocaleDateString()}</span>
          </li>
        {/each}
      </ol>
    {:else}
      <p class="empty">No scores yet.</p>
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
    margin-bottom: 12px;
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
  .seg {
    display: flex;
    background: var(--key);
    border-radius: 8px;
    padding: 3px;
  }
  .seg button {
    flex: 1;
    height: 34px;
    border-radius: 6px;
    font-size: 14px;
    color: var(--muted);
  }
  .seg button.on {
    background: var(--bg);
    color: var(--fg);
    box-shadow: 0 0 0 1px var(--faint);
  }
  .caption {
    margin: 12px 0 4px;
    color: var(--muted);
    font-size: 13px;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    text-align: center;
    padding: 12px 0 16px;
    border-bottom: 1px solid var(--faint);
  }
  .stats b {
    display: block;
    font-size: 24px;
    font-weight: 600;
  }
  .stats span {
    color: var(--muted);
    font-size: 12px;
  }
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    display: grid;
    grid-template-columns: 24px 64px 1fr auto;
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
  .main {
    font-size: 20px;
    font-weight: 600;
  }
  .empty {
    color: var(--muted);
    text-align: center;
    margin-top: 25%;
  }
</style>
