<script lang="ts">
  import { answerFor, formatFactors, type Factors } from './game';
  import { inputLock } from './lock.svelte';
  import Expr from './Expr.svelte';

  let {
    target,
    remaining,
    found,
    steps,
    hints,
    gaveUp,
    onmenu,
    onnext,
  }: {
    target: number;
    remaining: number;
    found: Factors;
    steps: number;
    hints: number;
    gaveUp: boolean;
    onmenu: () => void;
    onnext: () => void;
  } = $props();

  const lock = inputLock();

  let summary = $derived(
    [
      `${steps} ${steps === 1 ? 'step' : 'steps'}`,
      hints ? `${hints} ${hints === 1 ? 'hint' : 'hints'}` : 'no hints',
    ].join(' · ')
  );

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && lock.ready) onmenu();
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (lock.ready) onnext();
  }
</script>

<svelte:window {onkeydown} />

<div class="screen">
  <div class="screen-body center">
    <p class="label">{gaveUp ? 'Gave up' : 'Solved'}</p>
    <div class="big mono">{target}</div>
    <div class="answer mono">= <Expr value={answerFor(target)} /></div>
    <p class="sub">{summary}</p>

    {#if gaveUp}
      <dl>
        <div>
          <dt>You found</dt>
          <dd class="mono">
            {#if found.size}<Expr value={formatFactors(found)} />{:else}—{/if}
          </dd>
        </div>
        <div>
          <dt>Left</dt>
          <dd class="mono left">{remaining} = <Expr value={answerFor(remaining)} /></dd>
        </div>
      </dl>
    {/if}
  </div>
  <footer class="screen-footer">
    <button type="button" class="btn" disabled={!lock.ready} onclick={onmenu}>Menu</button>
    <button type="button" class="btn btn-primary" disabled={!lock.ready} onclick={onnext}
      >Next</button
    >
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
  .big {
    font-size: 72px;
    font-weight: 600;
    line-height: 1;
    margin-top: 12px;
    letter-spacing: -0.03em;
  }
  .answer {
    margin-top: 12px;
    font-size: clamp(22px, 7vw, 30px);
    overflow-wrap: anywhere;
  }
  .sub {
    margin: 12px 0 0;
    color: var(--muted);
    font-size: 15px;
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
    text-align: right;
  }
  .left {
    color: var(--danger);
  }
</style>
