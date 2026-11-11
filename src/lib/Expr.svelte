<script lang="ts">
  // Renders "2^3*5" as 2³ × 5, with a placeholder for a pending exponent.
  let { value }: { value: string } = $props();

  type Part = { base: string; exp: string | null };

  let parts = $derived(
    value.split('*').map((term): Part => {
      const i = term.indexOf('^');
      return i < 0 ? { base: term, exp: null } : { base: term.slice(0, i), exp: term.slice(i + 1) };
    })
  );
</script>

<span class="expr"
  >{#each parts as part, i (i)}{#if i > 0}<span class="op">×</span
      >{/if}{part.base}{#if part.exp !== null}<sup class:pending={part.exp === ''}
        >{part.exp || '□'}</sup
      >{/if}{/each}</span
>

<style>
  .op {
    margin: 0 0.25em;
    color: var(--muted);
  }
  sup {
    font-size: 0.6em;
    line-height: 0;
  }
  .pending {
    color: var(--muted);
  }
</style>
