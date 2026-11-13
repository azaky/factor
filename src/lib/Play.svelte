<script lang="ts">
  import { onMount } from 'svelte';
  import { answerFor, check } from './game';
  import type { EndReason, Result, Rules } from './modes';
  import Expr from './Expr.svelte';
  import Keypad from './Keypad.svelte';

  let { rules, onend }: { rules: Rules; onend: (result: Result) => void } = $props();

  // svelte-ignore state_referenced_locally
  const { clock, onWrong, next, label } = rules;

  let solved = $state(0);
  let misses = $state(0);
  let current = $state<number | null>(next(0));
  let input = $state('');
  let shake = $state(false);
  let flash = $state<{ text: string; id: number } | null>(null);
  let previous = $state<{ n: number; id: number } | null>(null);

  const gameStart = performance.now();
  let roundStart = gameStart;
  let now = $state(gameStart);
  let adjust = $state(0); // seconds added to the clock (bonus) or the score (penalty)
  let solveTime = 0;
  let done = false;

  let roundLimit = $derived(clock.kind === 'round' ? clock.seconds(solved) : 0);
  let remaining = $derived(
    clock.kind === 'round'
      ? roundLimit - (now - roundStart) / 1000
      : clock.kind === 'total'
        ? clock.seconds + adjust - (now - gameStart) / 1000
        : Infinity
  );
  let elapsed = $derived((now - gameStart) / 1000 + (clock.kind === 'stopwatch' ? adjust : 0));

  let timeText = $derived(
    clock.kind === 'stopwatch' ? elapsed.toFixed(1) : `${Math.max(0, Math.ceil(remaining))}`
  );
  let low = $derived(remaining <= 5);
  let fraction = $derived(
    clock.kind === 'round'
      ? remaining / roundLimit
      : clock.kind === 'total'
        ? remaining / clock.seconds
        : solved / (rules.total ?? 1)
  );

  function finish(reason: EndReason) {
    if (done) return;
    done = true;
    onend({
      mode: rules.mode,
      reason,
      solved,
      misses,
      solveTime,
      elapsed: (performance.now() - gameStart) / 1000 + (clock.kind === 'stopwatch' ? adjust : 0),
      lastNumber: current,
      lastInput: input,
    });
  }

  function showFlash(text: string) {
    flash = { text, id: (flash?.id ?? 0) + 1 };
  }

  /** After a miss, show what the skipped number was; a correct answer clears it. */
  function remember(n: number | null, missed: boolean) {
    if (!rules.showPrevious) return;
    previous = missed && n !== null ? { n, id: (previous?.id ?? 0) + 1 } : null;
  }

  function advance() {
    const n = next(solved);
    if (n === null) {
      finish('complete');
      return;
    }
    current = n;
    input = '';
    roundStart = performance.now();
  }

  function submit() {
    // Incomplete input (empty, or ending in * or ^) is a mistype, not a wrong answer.
    if (!input || /[*^]$/.test(input) || current === null) return;

    if (check(current, input)) {
      solveTime += (performance.now() - roundStart) / 1000;
      solved++;
      remember(current, false);
      if (clock.kind === 'total' && clock.bonus) {
        adjust += clock.bonus;
        showFlash(`+${clock.bonus}s`);
      }
      advance();
      return;
    }

    misses++;
    shake = true;
    if (onWrong.kind === 'end') {
      setTimeout(() => finish('wrong'), 350);
      return;
    }
    // penalty: lose time on a countdown, gain time on a stopwatch
    adjust += clock.kind === 'stopwatch' ? onWrong.seconds : -onWrong.seconds;
    showFlash(`${clock.kind === 'stopwatch' ? '+' : '−'}${onWrong.seconds}s`);
    setTimeout(() => {
      shake = false;
      if (done) return;
      if (onWrong.skip) {
        remember(current, true);
        advance();
      } else input = '';
    }, 350);
  }

  function press(key: string) {
    if (done || shake) return;
    if (key === 'Enter') submit();
    else if (key === 'Backspace') input = input.slice(0, -1);
    else if (key === 'Escape') finish('quit');
    else if (/^\d$/.test(key)) {
      // no leading zeros in a term
      const term = input.split(/[*^]/).pop() ?? '';
      if (key === '0' && term === '') return;
      if (input.length < 40) input += key;
    } else if (key === '*' || key === '^') {
      const last = input.at(-1);
      if (!last || last === '*' || last === '^') return;
      // only one exponent per term
      if (key === '^' && /\^\d+$/.test(input)) return;
      input += key;
    }
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    let key = e.key;
    if (key === 'x' || key === 'X' || key === '.') key = '*';
    if (/^[\d*^]$/.test(key) || ['Enter', 'Backspace', 'Escape'].includes(key)) {
      e.preventDefault();
      press(key);
    }
  }

  onMount(() => {
    let raf = 0;
    const tick = () => {
      now = performance.now();
      if (!done && remaining <= 0 && !(shake && onWrong.kind === 'end')) {
        finish('timeout');
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<svelte:window {onkeydown} />

<div class="screen">
  <header>
    <button type="button" class="quit" onclick={() => finish('quit')}>Quit</button>
    <span class="label">{label(solved)}</span>
    <span class="time mono" class:low>
      {#if flash}
        {#key flash.id}
          <span class="flash">{flash.text}</span>
        {/key}
      {/if}
      {timeText}s
    </span>
  </header>
  <div class="bar">
    <div class="fill" style:transform="scaleX({Math.min(1, Math.max(0, fraction))})"></div>
  </div>

  <section class="stage">
    {#if rules.showPrevious}
      <div class="previous mono">
        {#if previous}
          {#key previous.id}
            <span class="fade"
              >{previous.n} = <Expr value={answerFor(previous.n)} /><span class="missed"
                >missed</span
              ></span
            >
          {/key}
        {/if}
      </div>
    {/if}
    <div class="target mono">{current ?? ''}</div>
    <div class="answer mono" class:shake>
      {#if input}
        <Expr value={input} /><span class="caret"></span>
      {:else}
        <span class="caret"></span><span class="placeholder">e.g. 2^3*5</span>
      {/if}
    </div>
  </section>

  <Keypad onkey={press} />
</div>

<style>
  header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    height: 32px;
  }
  .quit {
    justify-self: start;
    color: var(--muted);
    font-size: 15px;
    padding: 6px 0;
  }
  .time {
    justify-self: end;
    font-size: 15px;
    position: relative;
  }
  .time.low {
    color: var(--danger);
  }
  .flash {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 6px;
    font-size: 13px;
    color: var(--muted);
    animation: rise 0.9s ease-out forwards;
    pointer-events: none;
  }
  .bar {
    height: 2px;
    background: var(--faint);
    margin-top: 8px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: var(--fg);
    transform-origin: left;
  }
  .stage {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: clamp(16px, 4dvh, 40px);
    padding: 16px 0;
    position: relative;
  }
  /* Pinned to the top of the stage, away from the current number. */
  .previous {
    position: absolute;
    top: 14px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 14px;
    color: var(--muted);
    white-space: nowrap;
  }
  .fade {
    display: inline-block;
    animation: settle 2.5s ease-out forwards;
  }
  .missed {
    margin-left: 8px;
    font-family: var(--sans);
    font-size: 12px;
    color: var(--danger);
  }
  .target {
    font-size: clamp(48px, 16vw, 80px);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1;
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
  @keyframes settle {
    0% {
      opacity: 1;
      color: var(--fg);
    }
    100% {
      opacity: 0.55;
      color: var(--muted);
    }
  }
  @keyframes rise {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
</style>
