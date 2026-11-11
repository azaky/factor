<script lang="ts">
  import { answerFor, type Result, type Settings } from './lib/game';
  import { addScore, boardLabel, formatTime, loadSettings, saveSettings } from './lib/storage';
  import Expr from './lib/Expr.svelte';
  import Play from './lib/Play.svelte';
  import SettingsView from './lib/SettingsView.svelte';
  import ScoresView from './lib/ScoresView.svelte';

  type View = 'menu' | 'play' | 'over' | 'settings' | 'scores';

  let view = $state<View>('menu');
  let settings = $state<Settings>(loadSettings());
  let result = $state<Result | null>(null);
  let rank = $state(-1);
  let gameId = $state(0);

  function play() {
    gameId++;
    view = 'play';
  }

  function end(r: Result) {
    if (r.reason === 'quit') {
      view = 'menu';
      return;
    }
    result = r;
    rank =
      r.rounds > 0
        ? addScore({
            rounds: r.rounds,
            time: r.time,
            date: Date.now(),
            settings: $state.snapshot(settings),
          })
        : -1;
    view = 'over';
  }

  function saveSettingsAndBack(s: Settings) {
    settings = s;
    saveSettings(s);
    view = 'menu';
  }

  const reasonText: Record<string, string> = {
    wrong: 'Wrong answer',
    timeout: "Time's up",
    complete: 'All rounds complete',
  };
</script>

<svelte:window
  onkeydown={e => {
    if ((view === 'menu' || view === 'over') && e.key === 'Enter') {
      e.preventDefault();
      play();
    }
  }}
/>

{#if view === 'play'}
  {#key gameId}
    <Play {settings} onend={end} />
  {/key}
{:else if view === 'settings'}
  <SettingsView {settings} onsave={saveSettingsAndBack} oncancel={() => (view = 'menu')} />
{:else if view === 'scores'}
  <ScoresView {settings} onback={() => (view = 'menu')} />
{:else if view === 'over' && result}
  <div class="screen">
    <div class="screen-body center">
      <p class="label">{reasonText[result.reason]}</p>
      <div class="big mono">{result.rounds}</div>
      <p class="sub">
        {result.rounds === 1 ? 'round' : 'rounds'}
        {#if result.rounds > 0}
          · {formatTime(result.time)} · {(result.time / result.rounds).toFixed(1)}s avg
        {/if}
      </p>
      {#if rank === 0}
        <p class="badge">New best</p>
      {:else if rank > 0}
        <p class="badge">#{rank + 1} on the board</p>
      {/if}

      {#if result.reason !== 'complete' && result.lastNumber !== null}
        <dl>
          <div>
            <dt>Answer</dt>
            <dd class="mono">
              {result.lastNumber} = <Expr value={answerFor(result.lastNumber)} />
            </dd>
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
      <button type="button" class="btn" onclick={() => (view = 'menu')}>Menu</button>
      <button type="button" class="btn btn-primary" onclick={play}>Play again</button>
    </footer>
  </div>
{:else}
  <div class="screen">
    <div class="screen-body center">
      <h1>Factor</h1>
      <p class="sub">Break each number into prime powers.</p>
      <p class="example mono">360 = <Expr value="2^3*3^2*5" /></p>
    </div>
    <p class="config label">{boardLabel(settings)}</p>
    <footer class="screen-footer stack">
      <button type="button" class="btn btn-primary" onclick={play}>Play</button>
      <div class="pair">
        <button type="button" class="btn" onclick={() => (view = 'settings')}>Settings</button>
        <button type="button" class="btn" onclick={() => (view = 'scores')}>Scores</button>
      </div>
    </footer>
  </div>
{/if}

<style>
  .center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  h1 {
    margin: 0;
    font-size: 44px;
    font-weight: 600;
    letter-spacing: -0.03em;
  }
  .sub {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 15px;
  }
  .example {
    margin: 32px 0 0;
    font-size: 20px;
  }
  .config {
    text-align: center;
    margin: 0;
    text-transform: none;
    letter-spacing: 0;
    font-size: 13px;
  }
  .stack {
    flex-direction: column;
  }
  .stack > * {
    flex: none;
  }
  .pair {
    display: flex;
    gap: 8px;
  }
  .pair > * {
    flex: 1;
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
