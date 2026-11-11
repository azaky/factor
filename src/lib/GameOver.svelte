<script lang="ts">
  import { answerFor } from './game';
  import type { Result } from './modes';
  import { formatTime } from './storage';
  import Expr from './Expr.svelte';

  let {
    result,
    rank,
    onmenu,
    onagain,
  }: { result: Result; rank: number; onmenu: () => void; onagain: () => void } = $props();

  const reasonText: Record<string, string> = {
    wrong: 'Wrong answer',
    timeout: "Time's up",
    complete: 'All rounds complete',
  };

  let caption = $derived(
    result.mode === 'blitz'
      ? 'Blitz'
      : result.mode === 'survival'
        ? `Survival · ${reasonText[result.reason]}`
        : reasonText[result.reason]
  );

  let unit = $derived(
    result.mode !== 'survival' ? 'solved' : result.solved === 1 ? 'level cleared' : 'levels cleared'
  );

  let detail = $derived.by(() => {
    if (result.mode === 'blitz') return `${result.misses} missed`;
    if (result.solved === 0) return '';
    return `${formatTime(result.solveTime)} · ${(result.solveTime / result.solved).toFixed(1)}s avg`;
  });

  // Blitz skips on a miss, so there is no single "last number" to explain.
  let showAnswer = $derived(
    result.mode !== 'blitz' && result.reason !== 'complete' && result.lastNumber !== null
  );
</script>

<div class="screen">
  <div class="screen-body center">
    <p class="label">{caption}</p>
    <div class="big mono">{result.solved}</div>
    <p class="sub">
      {unit}{#if detail}&nbsp;· {detail}{/if}
    </p>
    {#if rank === 0}
      <p class="badge">New best</p>
    {:else if rank > 0}
      <p class="badge">#{rank + 1} on the board</p>
    {/if}

    {#if showAnswer && result.lastNumber !== null}
      <dl>
        <div>
          <dt>Answer</dt>
          <dd class="mono">{result.lastNumber} = <Expr value={answerFor(result.lastNumber)} /></dd>
        </div>
        {#if result.lastInput}
          <div>
            <dt>You</dt>
            <dd class="mono wrong"><Expr value={result.lastInput} /></dd>
          </div>
        {/if}
      </dl>
    {/if}
  </div>
  <footer class="screen-footer">
    <button type="button" class="btn" onclick={onmenu}>Menu</button>
    <button type="button" class="btn btn-primary" onclick={onagain}>Play again</button>
  </footer>
</div>

<style>
  .center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .sub {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 15px;
  }
  .big {
    font-size: 88px;
    font-weight: 600;
    line-height: 1;
    margin-top: 12px;
    letter-spacing: -0.03em;
  }
  .badge {
    margin: 16px 0 0;
    padding: 4px 10px;
    border: 1px solid var(--faint);
    border-radius: 999px;
    font-size: 13px;
  }
  dl {
    margin: 40px 0 0;
    width: 100%;
    border-top: 1px solid var(--faint);
  }
  dl > div {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--faint);
  }
  dt {
    color: var(--muted);
    font-size: 13px;
  }
  dd {
    margin: 0;
    font-size: 18px;
    overflow-wrap: anywhere;
    text-align: right;
  }
  .wrong {
    color: var(--danger);
    text-decoration: line-through;
    text-decoration-thickness: 1px;
  }
</style>
