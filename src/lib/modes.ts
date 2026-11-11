/**
 * Game modes. Each mode is described by a Rules object that Play.svelte runs.
 */
import { isPrime, numberSource, rng, type Settings } from './game';

export type ModeId = 'daily' | 'blitz' | 'climb' | 'classic';

export type Clock =
  | { kind: 'round'; seconds: (solved: number) => number } // countdown per number
  | { kind: 'total'; seconds: number; bonus: number } // one countdown for the run
  | { kind: 'stopwatch' }; // counts up

export type OnWrong =
  | { kind: 'end' } // sudden death
  | { kind: 'penalty'; seconds: number; skip: boolean };

export interface Rules {
  mode: ModeId;
  /** Next number to factor, given how many have been solved. null = run complete. */
  next: (solved: number) => number | null;
  clock: Clock;
  onWrong: OnWrong;
  /** Known number of rounds, for display. */
  total: number | null;
  /** Header label, e.g. "Level 4". */
  label: (solved: number) => string;
}

export type EndReason = 'wrong' | 'timeout' | 'complete' | 'quit';

export interface Result {
  mode: ModeId;
  reason: EndReason;
  solved: number;
  misses: number;
  /** Seconds spent on numbers that were solved. */
  solveTime: number;
  /** Wall-clock seconds plus penalties (daily score). */
  elapsed: number;
  lastNumber: number | null;
  lastInput: string;
}

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

function between(rand: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rand() * (hi - lo + 1));
}

/**
 * Difficulty curve shared by Climb, Blitz and Daily. Level 0 is 10–100,
 * and every 10 levels adds a digit (level 10 ≈ 100–1000, 20 ≈ 1000–10000).
 * Large primes are hard to prove, so above two digits they are rerolled
 * most of the time.
 */
export function numberAt(rand: () => number, level: number): number {
  const hi = Math.round(10 ** (2 + level / 10));
  const lo = Math.max(10, Math.ceil(hi / 10));
  for (;;) {
    const n = between(rand, lo, hi);
    if (n > 100 && isPrime(n) && rand() < 0.7) continue;
    return n;
  }
}

/** A product of two distinct primes between 11 and 59, e.g. 1147 = 31 × 37. */
function boss(rand: () => number): number {
  const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59];
  const i = between(rand, 0, primes.length - 1);
  let j = between(rand, 0, primes.length - 2);
  if (j >= i) j++;
  return primes[i] * primes[j];
}

// ---------- Classic ----------

export function classicRules(settings: Settings): Rules {
  const next = numberSource(settings, settings.seed ?? randomSeed());
  return {
    mode: 'classic',
    next: () => next(),
    clock: { kind: 'round', seconds: () => settings.timeLimit },
    onWrong: { kind: 'end' },
    total: settings.roundLimit,
    label: solved => `Round ${solved + 1}${settings.roundLimit ? ` / ${settings.roundLimit}` : ''}`,
  };
}

// ---------- Blitz ----------

export const BLITZ = { seconds: 60, bonus: 2, penalty: 5 };

export function blitzRules(): Rules {
  const rand = rng(randomSeed());
  return {
    mode: 'blitz',
    // two digits for the first few, then three digits
    next: solved => numberAt(rand, Math.min(solved, 9)),
    clock: { kind: 'total', seconds: BLITZ.seconds, bonus: BLITZ.bonus },
    onWrong: { kind: 'penalty', seconds: BLITZ.penalty, skip: true },
    total: null,
    label: solved => `${solved} solved`,
  };
}

// ---------- Climb ----------

/** Seconds allowed at a given level: 30s, shrinking to 15s by level 30. */
export function climbSeconds(level: number): number {
  return Math.max(15, 30 - level * 0.5);
}

export function climbRules(): Rules {
  const rand = rng(randomSeed());
  return {
    mode: 'climb',
    next: solved => numberAt(rand, solved),
    clock: { kind: 'round', seconds: climbSeconds },
    onWrong: { kind: 'end' },
    total: null,
    label: solved => `Level ${solved + 1}`,
  };
}

// ---------- Daily ----------

export const DAILY = { rounds: 10, penalty: 10 };
const DAILY_EPOCH = Date.UTC(2026, 10, 11); // puzzle #1

/** Local calendar date as YYYY-MM-DD. */
export function dateKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function puzzleNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - DAILY_EPOCH) / 86400000) + 1;
}

function hash(s: string): number {
  // FNV-1a
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The day's numbers: same for everyone on the same date. */
export function dailyNumbers(key: string): number[] {
  const rand = rng(hash(`factor-daily-${key}`));
  const levels = [0, 3, 6, 8, 10, 12, 14, 16, 18];
  const out: number[] = [];
  for (const level of levels) {
    let n: number;
    do n = numberAt(rand, level);
    while (out.includes(n));
    out.push(n);
  }
  out.push(boss(rand));
  return out;
}

export function dailyRules(key: string): Rules {
  const numbers = dailyNumbers(key);
  return {
    mode: 'daily',
    next: solved => numbers[solved] ?? null,
    clock: { kind: 'stopwatch' },
    onWrong: { kind: 'penalty', seconds: DAILY.penalty, skip: false },
    total: numbers.length,
    label: solved => `${Math.min(solved + 1, numbers.length)} / ${numbers.length}`,
  };
}
