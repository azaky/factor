/**
 * Practice mode: factor a number step by step, untimed.
 */
import { factorize, isPrime, parse, type Factors } from './game';

export type Level = 'easy' | 'medium' | 'hard';

export const LEVELS: { id: Level; label: string; min: number; max: number }[] = [
  { id: 'easy', label: 'Easy', min: 10, max: 99 },
  { id: 'medium', label: 'Medium', min: 100, max: 999 },
  { id: 'hard', label: 'Hard', min: 1000, max: 9999 },
];

function primeFactorCount(n: number): number {
  let count = 0;
  for (const e of factorize(n).values()) count += e;
  return count;
}

/**
 * A number to practise on. Numbers with several prime factors make for
 * more interesting steps, so primes are mostly rerolled and numbers with
 * fewer than three prime factors (counting repeats) are rerolled half the time.
 */
export function practiceNumber(level: Level, rand: () => number = Math.random): number {
  const { min, max } = LEVELS.find(l => l.id === level) ?? LEVELS[1];
  for (;;) {
    const n = min + Math.floor(rand() * (max - min + 1));
    if (isPrime(n) && rand() < 0.9) continue;
    if (primeFactorCount(n) < 3 && rand() < 0.5) continue;
    return n;
  }
}

export type Step =
  | { ok: true; factors: Factors; divisor: number }
  | { ok: false; reason: 'invalid' | 'repeat' | 'not-divisible' }
  | { ok: false; reason: 'not-prime'; base: number };

/**
 * Checks one partial answer against what is left of the number. A step is
 * accepted when every base is prime, each prime appears once, and the
 * product divides the remaining number.
 */
export function checkStep(remaining: number, input: string): Step {
  const factors = parse(input);
  if (!factors) return { ok: false, reason: 'invalid' };

  const bases = input
    .replace(/\s+/g, '')
    .split('*')
    .map(t => Number(t.split('^')[0]));
  if (new Set(bases).size !== bases.length) return { ok: false, reason: 'repeat' };

  for (const p of factors.keys()) {
    if (!isPrime(p)) return { ok: false, reason: 'not-prime', base: p };
  }

  // divide one prime at a time, so huge powers can't overflow
  let rest = remaining;
  for (const [p, e] of factors) {
    for (let i = 0; i < e; i++) {
      if (rest % p !== 0) return { ok: false, reason: 'not-divisible' };
      rest /= p;
    }
  }
  return { ok: true, factors, divisor: remaining / rest };
}

/** Merges a step's factors into what has been found so far. */
export function mergeFactors(a: Factors, b: Factors): Factors {
  const out = new Map(a);
  for (const [p, e] of b) out.set(p, (out.get(p) ?? 0) + e);
  return out;
}

/** A random prime that divides n (not necessarily the smallest). */
export function hintPrime(n: number, rand: () => number = Math.random): number | null {
  const primes = [...factorize(n).keys()];
  return primes.length ? primes[Math.floor(rand() * primes.length)] : null;
}
