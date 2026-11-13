<script lang="ts">
  import type { Settings } from './lib/game';
  import {
    BLITZ,
    blitzRules,
    classicRules,
    survivalRules,
    dailyRules,
    dateKey,
    puzzleNumber,
    type ModeId,
    type Result,
    type Rules,
  } from './lib/modes';
  import {
    addScore,
    bestScore,
    classicBoard,
    classicLabel,
    dailyStreak,
    formatTime,
    loadDaily,
    loadSettings,
    saveDaily,
    saveSettings,
  } from './lib/storage';
  import Play from './lib/Play.svelte';
  import GameOver from './lib/GameOver.svelte';
  import DailyResult from './lib/DailyResult.svelte';
  import SettingsView from './lib/SettingsView.svelte';
  import ScoresView from './lib/ScoresView.svelte';
  import Practice from './lib/Practice.svelte';

  type View = 'menu' | 'play' | 'over' | 'daily' | 'practice' | 'settings' | 'scores';

  let view = $state<View>('menu');
  let settings = $state<Settings>(loadSettings());
  let rules = $state<Rules | null>(null);
  let result = $state<Result | null>(null);
  let rank = $state(-1);
  let gameId = $state(0);
  let scoresTab = $state<ModeId>('daily');

  // re-read storage-derived values whenever we come back to the menu
  let today = $state(dateKey());
  let daily = $state(loadDaily());
  let refresh = $state(0);
  let best = $derived.by(() => {
    void refresh;
    return {
      blitz: bestScore('blitz'),
      survival: bestScore('survival'),
      classic: bestScore(classicBoard(settings)),
    };
  });
  let todayEntry = $derived(daily[today]);
  let streak = $derived(dailyStreak(daily, today));

  function goMenu() {
    today = dateKey();
    daily = loadDaily();
    refresh++;
    view = 'menu';
  }

  function start(mode: ModeId) {
    if (mode === 'daily') {
      today = dateKey();
      daily = loadDaily();
      if (daily[today]) {
        view = 'daily';
        return;
      }
      // one attempt per day: record the start so quitting can't reveal-and-retry
      saveDaily(today, { done: false, time: 0, misses: 0 });
      rules = dailyRules(today);
    } else if (mode === 'blitz') rules = blitzRules();
    else if (mode === 'survival') rules = survivalRules();
    else rules = classicRules($state.snapshot(settings));
    gameId++;
    view = 'play';
  }

  function end(r: Result) {
    if (r.mode === 'daily') {
      if (r.reason === 'complete')
        saveDaily(today, { done: true, time: r.elapsed, misses: r.misses });
      daily = loadDaily();
      view = 'daily';
      return;
    }
    if (r.reason === 'quit') {
      goMenu();
      return;
    }
    result = r;
    rank = -1;
    if (r.solved > 0) {
      const date = Date.now();
      if (r.mode === 'blitz') rank = addScore('blitz', { rounds: r.solved, time: r.misses, date });
      else if (r.mode === 'survival')
        rank = addScore('survival', { rounds: r.solved, time: r.solveTime, date });
      else
        rank = addScore(classicBoard(settings), {
          rounds: r.solved,
          time: r.solveTime,
          date,
          settings: $state.snapshot(settings),
        });
    }
    view = 'over';
  }

  function openScores() {
    scoresTab = 'daily';
    view = 'scores';
  }
</script>

{#if view === 'play' && rules}
  {#key gameId}
    <Play {rules} onend={end} />
  {/key}
{:else if view === 'over' && result}
  <GameOver {result} {rank} onmenu={goMenu} onagain={() => result && start(result.mode)} />
{:else if view === 'daily'}
  <DailyResult date={today} entry={daily[today]} {streak} onmenu={goMenu} />
{:else if view === 'practice'}
  <Practice onmenu={goMenu} />
{:else if view === 'settings'}
  <SettingsView
    {settings}
    onsave={s => {
      settings = s;
      saveSettings(s);
      goMenu();
    }}
    oncancel={goMenu}
  />
{:else if view === 'scores'}
  <ScoresView {settings} tab={scoresTab} onback={goMenu} />
{:else}
  <div class="screen">
    <div class="screen-body">
      <div class="title">
        <h1>Factor</h1>
        <p class="sub">Break each number into prime powers.</p>
      </div>

      <ul class="modes">
        <li>
          <button type="button" onclick={() => start('daily')}>
            <span class="name">Daily <span class="tag mono">#{puzzleNumber(today)}</span></span>
            <span class="desc">Same 10 numbers for everyone today</span>
            <span class="stat mono">
              {#if todayEntry?.done}
                {formatTime(todayEntry.time)}
              {:else if todayEntry}
                Unfinished
              {:else}
                Play
              {/if}
              {#if streak > 0}<small>{streak} day streak</small>{/if}
            </span>
          </button>
        </li>
        <li>
          <button type="button" onclick={() => start('blitz')}>
            <span class="name">Blitz</span>
            <span class="desc"
              >{BLITZ.seconds}s. +{BLITZ.bonus}s right, −{BLITZ.penalty}s wrong</span
            >
            <span class="stat mono">
              {best.blitz ? best.blitz.rounds : '—'}<small>best</small>
            </span>
          </button>
        </li>
        <li>
          <button type="button" onclick={() => start('survival')}>
            <span class="name">Survival</span>
            <span class="desc">Bigger numbers, less time. One mistake ends it</span>
            <span class="stat mono">
              {best.survival ? best.survival.rounds : '—'}<small>best level</small>
            </span>
          </button>
        </li>
        <li>
          <button type="button" onclick={() => start('classic')}>
            <span class="name">Classic</span>
            <span class="desc">{classicLabel(settings)}</span>
            <span class="stat mono">
              {best.classic ? best.classic.rounds : '—'}<small>best</small>
            </span>
          </button>
        </li>
        <li>
          <button type="button" onclick={() => (view = 'practice')}>
            <span class="name">Practice</span>
            <span class="desc">Untimed, step by step, with hints</span>
          </button>
        </li>
      </ul>
    </div>
    <footer class="screen-footer">
      <button type="button" class="btn" onclick={openScores}>Scores</button>
      <button type="button" class="btn" onclick={() => (view = 'settings')}>Settings</button>
    </footer>
  </div>
{/if}

<style>
  .screen-body {
    display: flex;
    flex-direction: column;
  }
  .title {
    flex: 1;
    min-height: 140px;
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
  .modes {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--faint);
  }
  .modes button {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: 'name stat' 'desc stat';
    align-items: center;
    column-gap: 12px;
    row-gap: 2px;
    padding: 14px 4px;
    text-align: left;
    border-bottom: 1px solid var(--faint);
  }
  .modes button:active {
    background: var(--key);
  }
  .name {
    grid-area: name;
    font-size: 17px;
    font-weight: 500;
  }
  .tag {
    color: var(--muted);
    font-size: 13px;
    font-weight: 400;
    margin-left: 4px;
  }
  .desc {
    grid-area: desc;
    color: var(--muted);
    font-size: 13px;
  }
  .stat {
    grid-area: stat;
    text-align: right;
    font-size: 17px;
  }
  .stat small {
    display: block;
    color: var(--muted);
    font-family: var(--sans);
    font-size: 12px;
  }
</style>
