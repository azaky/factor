<script lang="ts">
  import { onMount } from 'svelte';
  import { check, numberSource, type EndReason, type Result, type Settings } from './game';
  import Expr from './Expr.svelte';
  import Keypad from './Keypad.svelte';

  let {
    settings,
    onend,
  }: {
    settings: Settings;
    onend: (result: Result) => void;
  } = $props();

  const seed = settings.seed ?? Math.floor(Math.random() * 2 ** 32);
  const next = numberSource(settings, seed);

  let current = $state<number | null>(next());
  let round = $state(1);
  let input = $state('');
  let solvedTime = 0;
  let roundStart = performance.now();
  let now = $state(performance.now());
  let shake = $state(false);
  let done = false;

  let remaining = $derived(Math.max(0, settings.timeLimit - (now - roundStart) / 1000));
  let fraction = $derived(remaining / settings.timeLimit);

  function finish(reason: EndReason) {
    if (done) return;
    done = true;
    onend({ reason, rounds: round - 1, time: solvedTime, lastNumber: current, lastInput: input });
  }

  function submit() {
    if (!input || current === null) return;
    if (!check(current, input)) {
      shake = true;
      setTimeout(() => finish('wrong'), 350);
      return;
    }
    solvedTime += (performance.now() - roundStart) / 1000;
    const n = next();
    if (n === null) {
      round++;
      current = null;
      finish('complete');
      return;
    }
    current = n;
    round++;
    input = '';
    roundStart = performance.now();
    now = roundStart;
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
      if (!done && !shake && now - roundStart >= settings.timeLimit * 1000) {
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
    <span class="label">
      Round {round}{settings.roundLimit ? ` / ${settings.roundLimit}` : ''}
    </span>
    <span class="time mono" class:low={remaining <= 5}>{Math.ceil(remaining)}s</span>
  </header>
  <div class="bar"><div class="fill" style:transform="scaleX({fraction})"></div></div>

  <section class="stage">
    <div class="target mono">{current}</div>
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
  }
  .time.low {
    color: var(--danger);
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
</style>
