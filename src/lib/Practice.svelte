<script lang="ts">
  import { editInput, formatFactors, isComplete, keypadKey, type Factors } from './game';
  import {
    LEVELS,
    checkStep,
    hintPrime,
    mergeFactors,
    practiceNumber,
    type Level,
  } from './practice';
  import { loadPracticeLevel, savePracticeLevel } from './storage';
  import Expr from './Expr.svelte';
  import Keypad from './Keypad.svelte';
  import PracticeDone from './PracticeDone.svelte';

  let { onmenu }: { onmenu: () => void } = $props();

  const initialLevel = loadPracticeLevel();
  const first = practiceNumber(initialLevel);
  let level = $state<Level>(initialLevel);
  let target = $state(first);
  let remaining = $state(first);
  let found = $state<Factors>(new Map());
  let input = $state('');
  let steps = $state(0);
  let hints = $state(0);
  let solved = $state(0);
  let outcome = $state<'solved' | 'gave-up' | null>(null);
  let shake = $state(false);

  /** Feedback under the input: a hint, or why a step was rejected. */
  let note = $state<
    | { kind: 'hint'; prime: number }
    | { kind: 'not-prime'; base: number }
    | { kind: 'not-divisible'; n: number; input: string }
    | { kind: 'repeat' }
    | null
  >(null);

  function newNumber() {
    target = practiceNumber(level);
    remaining = target;
    found = new Map();
    input = '';
    steps = 0;
    hints = 0;
    note = null;
    outcome = null;
  }

  function setLevel(l: Level) {
    if (l === level) return;
    level = l;
    savePracticeLevel(l);
    newNumber();
  }

  function reject(n: typeof note) {
    note = n;
    shake = true;
    setTimeout(() => {
      shake = false;
      input = '';
    }, 350);
  }

  function submit() {
    if (!isComplete(input)) return;
    const step = checkStep(remaining, input);
    if (!step.ok) {
      if (step.reason === 'not-prime') reject({ kind: 'not-prime', base: step.base });
      else if (step.reason === 'repeat') reject({ kind: 'repeat' });
      else reject({ kind: 'not-divisible', n: remaining, input });
      return;
    }
    found = mergeFactors(found, step.factors);
    remaining /= step.divisor;
    steps++;
    input = '';
    note = null;
    if (remaining === 1) {
      solved++;
      outcome = 'solved';
    }
  }

  function hint() {
    const p = hintPrime(remaining);
    if (p === null) return;
    hints++;
    note = { kind: 'hint', prime: p };
  }

  function press(key: string) {
    if (shake || outcome) return;
    if (key === 'Enter') submit();
    else if (key === 'Escape') onmenu();
    else input = editInput(input, key);
  }

  function onkeydown(e: KeyboardEvent) {
    if (outcome) return; // the finished screen handles its own keys
    const key = keypadKey(e);
    if (!key) return;
    e.preventDefault();
    press(key);
  }
</script>

<svelte:window {onkeydown} />

{#if outcome}
  <PracticeDone
    {target}
    {remaining}
    {found}
    {steps}
    {hints}
    gaveUp={outcome === 'gave-up'}
    {onmenu}
    onnext={newNumber}
  />
{:else}
  <div class="screen">
    <header>
      <button type="button" class="link" onclick={onmenu}>Quit</button>
      <span class="label">Practice</span>
      <span class="count">{solved} solved</span>
    </header>

    <div class="seg">
      {#each LEVELS as l (l.id)}
        <button type="button" class:on={level === l.id} onclick={() => setLevel(l.id)}
          >{l.label}</button
        >
      {/each}
    </div>

    <section class="stage">
      <div class="progress mono">
        {#if found.size}
          {target} = <Expr value={formatFactors(found)} /><span class="op">×</span>
        {/if}
      </div>
      <div class="target mono">{remaining}</div>
      <div class="answer mono" class:shake>
        {#if input}
          <Expr value={input} /><span class="caret"></span>
        {:else}
          <span class="caret"></span><span class="placeholder">e.g. <Expr value="2^3*5" /></span>
        {/if}
      </div>
      <div class="note" class:error={note && note.kind !== 'hint'}>
        {#if note?.kind === 'hint'}
          Try <span class="mono">{note.prime}</span>
        {:else if note?.kind === 'not-prime'}
          <span class="mono">{note.base}</span> isn't prime
        {:else if note?.kind === 'not-divisible'}
          <span class="mono">{note.n}</span> isn't divisible by
          <span class="mono"><Expr value={note.input} /></span>
        {:else if note?.kind === 'repeat'}
          Write each prime once, e.g. <span class="mono"><Expr value="2^2" /></span>
        {/if}
      </div>
    </section>

    <div class="actions">
      <button type="button" class="link" onpointerdown={e => e.preventDefault()} onclick={hint}
        >Hint</button
      >
      <button
        type="button"
        class="link"
        onpointerdown={e => e.preventDefault()}
        onclick={() => (outcome = 'gave-up')}>Give up</button
      >
    </div>
    <Keypad onkey={press} />
  </div>
{/if}

<style>
  header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    height: 32px;
  }
  .link {
    color: var(--muted);
    font-size: 15px;
    padding: 6px 0;
  }
  header .link {
    justify-self: start;
  }
  .count {
    justify-self: end;
    color: var(--muted);
    font-size: 15px;
  }
  .seg {
    display: flex;
    background: var(--key);
    border-radius: 8px;
    padding: 3px;
    margin-top: 8px;
  }
  .seg button {
    flex: 1;
    height: 30px;
    border-radius: 6px;
    font-size: 13px;
    color: var(--muted);
  }
  .seg button.on {
    background: var(--bg);
    color: var(--fg);
    box-shadow: 0 0 0 1px var(--faint);
  }
  .stage {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
  }
  .progress {
    min-height: 24px;
    font-size: 17px;
    color: var(--muted);
    white-space: nowrap;
  }
  .op {
    margin-left: 0.25em;
  }
  .target {
    font-size: clamp(48px, 16vw, 80px);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: clamp(4px, 2dvh, 24px);
  }
  .answer {
    width: 100%;
    min-height: 56px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: clamp(22px, 7vw, 30px);
    border-bottom: 1px solid var(--faint);
    padding-bottom: 8px;
    overflow-x: auto;
    white-space: nowrap;
  }
  .placeholder {
    color: var(--muted);
    opacity: 0.6;
  }
  .caret {
    width: 2px;
    height: 1.1em;
    margin-left: 2px;
    background: var(--fg);
    animation: blink 1s steps(1) infinite;
  }
  .note {
    min-height: 20px;
    font-size: 14px;
    color: var(--muted);
    text-align: center;
  }
  .note.error {
    color: var(--danger);
  }
  .actions {
    display: flex;
    justify-content: space-between;
    padding: 0 4px 8px;
  }
  .shake {
    color: var(--danger);
    animation: shake 0.3s;
  }
  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
  @keyframes shake {
    25% {
      transform: translateX(-6px);
    }
    75% {
      transform: translateX(6px);
    }
  }
</style>
