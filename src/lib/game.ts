/**
 * Core game logic: factorization, input validation, number generation.
 */

export type GameMode = 'sequential' | 'random';

export interface Settings {
  mode: GameMode;
  min: number;
  max: number;
  timeLimit: number; // seconds per round
  seed: number | null; // null = new random seed each game
  roundLimit: number | null; // null = endless
}

export const DEFAULT_SETTINGS: Settings = {
  mode: 'random',
  min: 100,
  max: 999,
  timeLimit: 30,
  seed: null,
  roundLimit: null,
};

export type Factors = Map<number, number>;

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function factorize(n: number): Factors {
  const factors: Factors = new Map();
  let rest = n;
  for (let p = 2; p * p <= rest; p += p === 2 ? 1 : 2) {
    while (rest % p === 0) {
      factors.set(p, (factors.get(p) ?? 0) + 1);
      rest /= p;
    }
  }
  if (rest > 1) factors.set(rest, (factors.get(rest) ?? 0) + 1);
  return factors;
}

/** Canonical answer string, e.g. 360 -> "2^3*3^2*5". */
export function answerFor(n: number): string {
  if (n === 1) return '1';
  return formatFactors(factorize(n));
}

/** Factor map as an input-style string in ascending order, e.g. "2^3*3^2*5". */
export function formatFactors(factors: Factors): string {
  return [...factors]
    .sort((a, b) => a[0] - b[0])
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^${e}`))
    .join('*');
}

/**
 * Parse "2^3*5" into a factor map. Returns null on malformed input.
 * Repeated bases are merged (2*2 -> 2^2) so the caller can decide
 * whether that is acceptable.
 */
export function parse(input: string): Factors | null {
  const s = input.replace(/\s+/g, '');
  if (!/^\d+(\^\d+)?(\*\d+(\^\d+)?)*$/.test(s)) return null;
  const factors: Factors = new Map();
  for (const term of s.split('*')) {
    const [b, e = '1'] = term.split('^');
    const base = Number(b);
    const exp = Number(e);
    if (base < 1 || exp < 1) return null;
    factors.set(base, (factors.get(base) ?? 0) + exp);
  }
  return factors;
}

/**
 * An answer is correct when every base is prime, each prime appears
 * once (as a prime power), and the product equals the target.
 * For 1, the only accepted answer is "1".
 */
export function check(n: number, input: string): boolean {
  const s = input.replace(/\s+/g, '');
  if (n === 1) return s === '1';

  const terms = s.split('*').map(t => Number(t.split('^')[0]));
  if (new Set(terms).size !== terms.length) return false;

  const given = parse(s);
  if (!given) return false;
  const expected = factorize(n);
  if (given.size !== expected.size) return false;
  for (const [p, e] of given) {
    if (!isPrime(p) || expected.get(p) !== e) return false;
  }
  return true;
}

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Yields the sequence of numbers for one game. */
export function numberSource(settings: Settings, seed: number): () => number | null {
  const { mode, min, max, roundLimit } = settings;
  let round = 0;
  const rand = rng(seed);
  return () => {
    if (roundLimit !== null && round >= roundLimit) return null;
    round++;
    if (mode === 'sequential') {
      const n = min + round - 1;
      return n <= max ? n : null;
    }
    return min + Math.floor(rand() * (max - min + 1));
  };
}

export function sanitize(s: Partial<Settings>): Settings {
  const int = (v: unknown, fallback: number, lo: number, hi: number) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
  };
  const min = int(s.min, DEFAULT_SETTINGS.min, 1, 1e9);
  return {
    mode: s.mode === 'sequential' ? 'sequential' : 'random',
    min,
    max: int(s.max, DEFAULT_SETTINGS.max, min, 1e9),
    timeLimit: int(s.timeLimit, DEFAULT_SETTINGS.timeLimit, 3, 600),
    seed: s.seed === null || s.seed === undefined ? null : int(s.seed, 0, 0, 2 ** 32 - 1),
    roundLimit:
      s.roundLimit === null || s.roundLimit === undefined ? null : int(s.roundLimit, 10, 1, 10000),
  };
}

// ---------- Answer input ----------

/** Applies one keypad key to the answer being typed; invalid keys leave it unchanged. */
export function editInput(input: string, key: string): string {
  if (key === 'Backspace') return input.slice(0, -1);
  if (/^\d$/.test(key)) {
    // no leading zeros in a term
    const term = input.split(/[*^]/).pop() ?? '';
    if (key === '0' && term === '') return input;
    return input.length < 40 ? input + key : input;
  }
  if (key === '*' || key === '^') {
    const last = input.at(-1);
    if (!last || last === '*' || last === '^') return input;
    // only one exponent per term
    if (key === '^' && /\^\d+$/.test(input)) return input;
    return input + key;
  }
  return input;
}

/** Empty input, or input ending in * or ^, is a mistype rather than an answer. */
export function isComplete(input: string): boolean {
  return input !== '' && !/[*^]$/.test(input);
}

/** Maps a physical key press to a keypad key, or null if the game doesn't use it. */
export function keypadKey(e: KeyboardEvent): string | null {
  if (e.metaKey || e.ctrlKey || e.altKey) return null;
  const key = e.key === 'x' || e.key === 'X' || e.key === '.' ? '*' : e.key;
  return /^[\d*^]$/.test(key) || ['Enter', 'Backspace', 'Escape'].includes(key) ? key : null;
}
