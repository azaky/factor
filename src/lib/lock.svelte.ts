import { onMount } from 'svelte';

/**
 * How long result screens ignore input after appearing, so a tap or Enter
 * meant for the last answer doesn't land on "Play again".
 */
export const RESULT_LOCK_MS = 600;

/** Returns an object whose `ready` turns true once the lock has elapsed. */
export function inputLock(ms: number = RESULT_LOCK_MS): { readonly ready: boolean } {
  let ready = $state(false);
  onMount(() => {
    const id = setTimeout(() => (ready = true), ms);
    return () => clearTimeout(id);
  });
  return {
    get ready() {
      return ready;
    },
  };
}
