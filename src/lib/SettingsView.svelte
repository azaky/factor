<script lang="ts">
  import { sanitize, DEFAULT_SETTINGS, type Settings } from './game';

  let {
    settings,
    onsave,
    oncancel,
  }: {
    settings: Settings;
    onsave: (s: Settings) => void;
    oncancel: () => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  const initial = settings;
  let mode = $state(initial.mode);
  let min = $state(initial.min);
  let max = $state(initial.max);
  let timeLimit = $state(initial.timeLimit);
  let roundLimit = $state<number | null>(initial.roundLimit);
  let fixedSeed = $state(initial.seed !== null);
  let seed = $state(initial.seed ?? Math.floor(Math.random() * 100000));

  const roundOptions: (number | null)[] = [null, 10, 25, 50, 100];

  function save() {
    onsave(sanitize({ mode, min, max, timeLimit, roundLimit, seed: fixedSeed ? seed : null }));
  }

  function reset() {
    ({ mode, min, max, timeLimit, roundLimit } = DEFAULT_SETTINGS);
    fixedSeed = false;
  }
</script>

<div class="screen">
  <header>
    <h2>Settings</h2>
    <button type="button" class="reset" onclick={reset}>Reset</button>
  </header>

  <div class="screen-body">
    <div class="row">
      <span>Order</span>
      <div class="seg">
        <button type="button" class:on={mode === 'random'} onclick={() => (mode = 'random')}
          >Random</button
        >
        <button type="button" class:on={mode === 'sequential'} onclick={() => (mode = 'sequential')}
          >Sequential</button
        >
      </div>
    </div>

    <div class="row">
      <span>Range</span>
      <div class="range">
        <input class="mono" type="number" inputmode="numeric" min="1" bind:value={min} />
        <span class="dash">–</span>
        <input class="mono" type="number" inputmode="numeric" min="1" bind:value={max} />
      </div>
    </div>

    <div class="row">
      <span>Seconds per round</span>
      <input
        class="mono"
        type="number"
        inputmode="numeric"
        min="3"
        max="600"
        bind:value={timeLimit}
      />
    </div>

    <div class="row col">
      <span>Rounds</span>
      <div class="seg full">
        {#each roundOptions as opt (opt)}
          <button type="button" class:on={roundLimit === opt} onclick={() => (roundLimit = opt)}
            >{opt ?? '∞'}</button
          >
        {/each}
      </div>
    </div>

    {#if mode === 'random'}
      <div class="row">
        <span>
          Fixed seed
          <small>Same seed, same numbers</small>
        </span>
        <div class="seed">
          {#if fixedSeed}
            <input class="mono" type="number" inputmode="numeric" min="0" bind:value={seed} />
          {/if}
          <input type="checkbox" class="toggle" bind:checked={fixedSeed} aria-label="Fixed seed" />
        </div>
      </div>
    {/if}

    <p class="note">
      Enter each prime once with its power, e.g. <span class="mono">360 → 2^3*3^2*5</span>. Order
      doesn't matter. A wrong answer or timeout ends the game.
    </p>
  </div>

  <footer class="screen-footer">
    <button type="button" class="btn" onclick={oncancel}>Cancel</button>
    <button type="button" class="btn btn-primary" onclick={save}>Save</button>
  </footer>
</div>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }
  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }
  .reset {
    color: var(--muted);
    font-size: 15px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    min-height: 60px;
    padding: 10px 0;
    border-bottom: 1px solid var(--faint);
  }
  .row.col {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  small {
    display: block;
    color: var(--muted);
    font-size: 13px;
    margin-top: 2px;
  }
  input[type='number'] {
    width: 88px;
    height: 40px;
    padding: 0 10px;
    border: 1px solid var(--faint);
    border-radius: 8px;
    background: transparent;
    color: var(--fg);
    font-size: 16px;
    text-align: right;
    appearance: textfield;
    -moz-appearance: textfield;
  }
  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .range,
  .seed {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dash {
    color: var(--muted);
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
    padding: 0 12px;
    border-radius: 6px;
    font-size: 14px;
    color: var(--muted);
  }
  .seg button.on {
    background: var(--bg);
    color: var(--fg);
    box-shadow: 0 0 0 1px var(--faint);
  }
  .toggle {
    appearance: none;
    -webkit-appearance: none;
    width: 44px;
    height: 26px;
    border-radius: 13px;
    background: var(--faint);
    position: relative;
    cursor: pointer;
    margin: 0;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .toggle::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--bg);
    transition: transform 0.15s;
  }
  .toggle:checked {
    background: var(--fg);
  }
  .toggle:checked::after {
    transform: translateX(18px);
  }
  .note {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.5;
    margin: 16px 0 0;
  }
</style>
