<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const buttons: string[][] = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '^'],
    ['⌫', 'Enter'],
  ];

  function handleButtonClick(value: string): void {
    if (value === '⌫') {
      dispatch('input', 'backspace');
    } else if (value === 'Enter') {
      dispatch('input', 'enter');
    } else {
      dispatch('input', value);
    }
  }
</script>

<div class="grid gap-3 mt-4">
  {#each buttons as row}
    <div class="grid gap-3" style="grid-template-columns: repeat({row.length}, 1fr);">
      {#each row as button}
        <button
          class="h-16 min-h-[64px] rounded-xl font-bold text-xl transition-all duration-200 select-none shadow-lg backdrop-blur-sm border border-white/20
                 {button === 'Enter'
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/30'
            : button === '⌫'
              ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30'
              : 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white shadow-slate-700/30'}
                 active:scale-95 hover:scale-105 hover:shadow-xl transform touch-manipulation"
          on:click={() => handleButtonClick(button)}
        >
          {button}
        </button>
      {/each}
    </div>
  {/each}
</div>
