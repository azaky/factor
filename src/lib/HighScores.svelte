<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getHighScores, formatTime, clearHighScores, type ScoreEntry } from './highScores.ts';

  export let gameMode: 'sequential' | 'random';

  const dispatch = createEventDispatcher();

  $: scores = getHighScores(gameMode);

  function handleBack() {
    dispatch('back');
  }

  function handleClearScores() {
    if (confirm('Are you sure you want to clear all high scores? This cannot be undone.')) {
      clearHighScores(gameMode);
      // Force reactivity update
      scores = getHighScores(gameMode);
    }
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
</script>

<div class="space-y-6">
  <div class="text-center">
    <h2 class="text-2xl font-bold mb-2">High Scores</h2>
    <p class="text-blue-200 text-sm capitalize">{gameMode} Mode</p>
  </div>

  <div class="bg-white/10 rounded-lg p-6">
    {#if scores.length === 0}
      <div class="text-center py-8">
        <p class="text-gray-400 text-lg mb-2">No high scores yet</p>
        <p class="text-gray-500 text-sm">Play a game to set your first record!</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each scores as score, index}
          <div class="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div class="flex items-center space-x-3">
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black text-sm"
              >
                {index + 1}
              </div>
              <div>
                <div class="font-semibold text-white">
                  {score.score} rounds
                </div>
                <div class="text-xs text-gray-400">
                  {formatTime(score.totalTime)} • avg {(score.totalTime / score.score).toFixed(1)}s
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-400">
                {formatDate(score.timestamp)}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-6 pt-4 border-t border-gray-600">
        <button
          class="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          on:click={handleClearScores}
        >
          Clear All Scores
        </button>
      </div>
    {/if}
  </div>

  <div class="flex gap-4">
    <button
      class="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
      on:click={handleBack}
    >
      Back to Menu
    </button>
  </div>
</div>
