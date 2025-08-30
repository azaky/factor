<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { GameConfig } from './gameLogic';

  export let config: GameConfig;

  const dispatch = createEventDispatcher();

  // Local copy of config for editing
  let localConfig: GameConfig = { ...config };

  function handleSave() {
    // Validate config before saving
    if (localConfig.startNumber < 1) localConfig.startNumber = 1;
    if (localConfig.endNumber < localConfig.startNumber)
      localConfig.endNumber = localConfig.startNumber;
    if (localConfig.timeLimit < 5) localConfig.timeLimit = 5;
    if (localConfig.roundLimit && localConfig.roundLimit < 1) localConfig.roundLimit = 1;

    dispatch('save', localConfig);
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function generateNewSeed() {
    localConfig.randomSeed = Date.now();
  }
</script>

<div class="space-y-6">
  <div class="text-center">
    <h2 class="text-2xl font-bold mb-2">Game Settings</h2>
    <p class="text-blue-200 text-sm">Configure your game preferences</p>
  </div>

  <div class="bg-white/10 rounded-lg p-6 space-y-6">
    <!-- Game Mode -->
    <div>
      <div class="block text-sm font-semibold mb-3">Game Mode</div>
      <div class="space-y-2">
        <label class="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            bind:group={localConfig.gameMode}
            value="sequential"
            class="w-4 h-4 text-blue-600"
          />
          <div>
            <div class="font-medium">Sequential</div>
            <div class="text-xs text-blue-200">Factor numbers in order (1, 2, 3...)</div>
          </div>
        </label>

        <label class="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            bind:group={localConfig.gameMode}
            value="random"
            class="w-4 h-4 text-blue-600"
          />
          <div>
            <div class="font-medium">Random</div>
            <div class="text-xs text-blue-200">Factor random numbers in range</div>
          </div>
        </label>
      </div>
    </div>

    <!-- Number Range -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="startNumber" class="block text-sm font-semibold mb-2">
          {localConfig.gameMode === 'sequential' ? 'Start Number' : 'Min Number'}
        </label>
        <input
          id="startNumber"
          type="number"
          bind:value={localConfig.startNumber}
          min="1"
          class="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="endNumber" class="block text-sm font-semibold mb-2">
          {localConfig.gameMode === 'sequential' ? 'End Number' : 'Max Number'}
        </label>
        <input
          id="endNumber"
          type="number"
          bind:value={localConfig.endNumber}
          min={localConfig.startNumber}
          class="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- Time Limit -->
    <div>
      <label for="timeLimit" class="block text-sm font-semibold mb-2">Time Limit (seconds)</label>
      <input
        id="timeLimit"
        type="number"
        bind:value={localConfig.timeLimit}
        min="5"
        max="300"
        class="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
      />
    </div>

    {#if localConfig.gameMode === 'random'}
      <!-- Random Seed -->
      <div>
        <label for="randomSeed" class="block text-sm font-semibold mb-2">Random Seed</label>
        <div class="flex gap-2">
          <input
            id="randomSeed"
            type="number"
            bind:value={localConfig.randomSeed}
            disabled={localConfig.autoRandomSeed}
            class="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            on:click={generateNewSeed}
            disabled={localConfig.autoRandomSeed}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            New
          </button>
        </div>
        <p class="text-xs text-blue-200 mt-1">
          {#if localConfig.autoRandomSeed}
            Auto-random is enabled - seed will change on each game restart
          {:else}
            Same seed = same sequence of numbers
          {/if}
        </p>
      </div>

      <!-- Auto Random Seed -->
      <div>
        <label class="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={localConfig.autoRandomSeed}
            class="w-4 h-4 text-blue-600"
          />
          <div>
            <div class="text-sm font-semibold">Auto Random Seed</div>
            <div class="text-xs text-blue-200">
              Generate new seed automatically on each game restart
            </div>
          </div>
        </label>
      </div>

      <!-- Round Limit -->
      <div>
        <div class="block text-sm font-semibold mb-3">Round Limit</div>
        <div class="space-y-2">
          <label class="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              bind:group={localConfig.roundLimit}
              value={null}
              class="w-4 h-4 text-blue-600"
            />
            <span>Endless (until wrong answer or timeout)</span>
          </label>

          <label class="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              bind:group={localConfig.roundLimit}
              value={50}
              class="w-4 h-4 text-blue-600"
            />
            <span>50 rounds</span>
          </label>

          <label class="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              bind:group={localConfig.roundLimit}
              value={100}
              class="w-4 h-4 text-blue-600"
            />
            <span>100 rounds</span>
          </label>
        </div>
      </div>
    {/if}
  </div>

  <!-- Buttons -->
  <div class="flex gap-4">
    <button
      class="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
      on:click={handleCancel}
    >
      Cancel
    </button>

    <button
      class="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
      on:click={handleSave}
    >
      Save
    </button>
  </div>
</div>
