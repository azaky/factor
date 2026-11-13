<script lang="ts">
  import { onMount } from 'svelte';
  import { answerFor } from './game';
  import { DAILY, dailyNumbers, puzzleNumber } from './modes';
  import { formatTime, type DailyEntry } from './storage';
  import Expr from './Expr.svelte';
  import { inputLock } from './lock.svelte';

  let {
    date,
    entry,
    streak,
    onmenu,
  }: { date: string; entry: DailyEntry | undefined; streak: number; onmenu: () => void } = $props();

  let numbers = $derived(dailyNumbers(date));
  let num = $derived(puzzleNumber(date));
  let done = $derived(entry?.done ?? false);
  let copied = $state(false);
  const lock = inputLock();

  let now = $state(Date.now());
  let untilNext = $derived.by(() => {
    const d = new Date(now);
    const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    const s = Math.max(0, Math.floor((midnight - now) / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  });

  onMount(() => {
    const id = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(id);
  });

  function shareText(): string {
    const url = new URL(import.meta.env.BASE_URL, location.origin).href;
    const misses = entry?.misses ?? 0;
    const line = done
      ? `${formatTime(entry!.time)} · ${misses === 0 ? 'no misses' : `${misses} miss${misses === 1 ? '' : 'es'}`}`
      : 'did not finish';
    return `Factor #${num}\n${line}\n${url}`;
  }

  async function share() {
    const text = shareText();
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      // user cancelled the share sheet or clipboard is blocked
    }
  }
</script>

<div class="screen">
  <div class="screen-body">
    <div class="head">
      <p class="label">Daily #{num}</p>
      {#if done && entry}
        <div class="big mono">{formatTime(entry.time)}</div>
        <p class="sub">
          {entry.misses === 0
            ? 'No misses'
            : `${entry.misses} miss${entry.misses === 1 ? '' : 'es'} · +${entry.misses * DAILY.penalty}s`}
        </p>
      {:else}
        <div class="big dnf">Did not finish</div>
        <p class="sub">One attempt per day</p>
      {/if}
      <p class="meta">
        <span><b class="mono">{streak}</b> day streak</span>
        <span>Next in <b class="mono">{untilNext}</b></span>
      </p>
    </div>

    <ol class="numbers">
      {#each numbers as n, i (i)}
        <li class="mono">
          <span class="n">{n}</span>
          <span class="f"><Expr value={answerFor(n)} /></span>
        </li>
      {/each}
    </ol>
  </div>
  <footer class="screen-footer">
    <button type="button" class="btn" disabled={!lock.ready} onclick={onmenu}>Menu</button>
    <button type="button" class="btn btn-primary" disabled={!lock.ready} onclick={share}>
      {copied ? 'Copied' : 'Share'}
    </button>
  </footer>
</div>

<style>
  .head {
    text-align: center;
    padding: 24px 0 20px;
  }
  .big {
    font-size: 64px;
    font-weight: 600;
    line-height: 1;
    margin-top: 12px;
    letter-spacing: -0.03em;
  }
  .dnf {
    font-size: 32px;
    letter-spacing: -0.01em;
  }
  .sub {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 15px;
  }
  .meta {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 20px 0 0;
    font-size: 13px;
    color: var(--muted);
  }
  .meta b {
    color: var(--fg);
    font-weight: 500;
  }
  .numbers {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--faint);
  }
  .numbers li {
    display: flex;
    justify-content: space-between;
    padding: 9px 4px;
    border-bottom: 1px solid var(--faint);
    font-size: 15px;
  }
  .f {
    color: var(--muted);
  }
</style>
