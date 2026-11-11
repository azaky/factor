<script lang="ts">
  let { onkey }: { onkey: (key: string) => void } = $props();

  // Layout (4 columns):
  //   7 8 9 ⌫
  //   4 5 6 ×
  //   1 2 3 ^
  //   0 0 ↵ ↵
  const keys: { key: string; label: string; cls?: string }[] = [
    { key: '7', label: '7' },
    { key: '8', label: '8' },
    { key: '9', label: '9' },
    { key: 'Backspace', label: '⌫', cls: 'op' },
    { key: '4', label: '4' },
    { key: '5', label: '5' },
    { key: '6', label: '6' },
    { key: '*', label: '×', cls: 'op' },
    { key: '1', label: '1' },
    { key: '2', label: '2' },
    { key: '3', label: '3' },
    { key: '^', label: 'xⁿ', cls: 'op' },
    { key: '0', label: '0', cls: 'wide' },
    { key: 'Enter', label: 'Enter', cls: 'wide enter' },
  ];
</script>

<div class="keypad">
  {#each keys as k (k.key)}
    <button
      type="button"
      class="key {k.cls ?? ''}"
      aria-label={k.key}
      onpointerdown={e => {
        e.preventDefault();
        onkey(k.key);
      }}
      onclick={e => {
        // keyboard activation (Enter/Space on a focused key); pointer is handled above
        if (e.detail === 0) onkey(k.key);
      }}>{k.label}</button
    >
  {/each}
</div>

<style>
  .keypad {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .key {
    height: clamp(48px, 8dvh, 64px);
    border-radius: var(--radius);
    background: var(--key);
    font-size: 22px;
    font-family: var(--mono);
  }
  .key:active {
    background: var(--key-active);
  }
  .op {
    color: var(--muted);
    font-size: 20px;
  }
  .wide {
    grid-column: span 2;
  }
  .enter {
    background: var(--fg);
    color: var(--bg);
    font-family: var(--sans);
    font-size: 16px;
    font-weight: 500;
  }
  .enter:active {
    background: var(--fg);
    opacity: 0.85;
  }
</style>
