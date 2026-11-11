import { DEFAULT_SETTINGS, sanitize, type Settings } from './game';
import { dateKey } from './modes';

export interface Score {
  rounds: number; // solved numbers (Blitz/Classic) or level reached (Survival)
  time: number; // seconds; tie-breaker, lower is better
  date: number;
  settings?: Settings; // Classic only
}

const SETTINGS_KEY = 'factor:settings';
const SCORES_KEY = 'factor:scores';
const DAILY_KEY = 'factor:daily';
const MAX_SCORES = 10;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode, quota); ignore
  }
}

// ---------- Settings (Classic) ----------

export function loadSettings(): Settings {
  return sanitize({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(SETTINGS_KEY, {}) });
}

export function saveSettings(s: Settings): void {
  write(SETTINGS_KEY, s);
}

// ---------- Score boards ----------

/** Classic scores are grouped by the settings that affect difficulty. */
export function classicBoard(s: Settings): string {
  const rounds = s.roundLimit ?? '∞';
  return `${s.mode}:${s.min}-${s.max}:${s.timeLimit}s:${rounds}`;
}

export function classicLabel(s: Settings): string {
  const mode = s.mode === 'random' ? 'Random' : 'Sequential';
  const rounds = s.roundLimit ? `${s.roundLimit} rounds` : 'endless';
  return `${mode} · ${s.min}–${s.max} · ${s.timeLimit}s · ${rounds}`;
}

function sortScores(a: Score, b: Score): number {
  return b.rounds - a.rounds || a.time - b.time;
}

export function loadScores(board: string): Score[] {
  const list = read<Record<string, Score[]>>(SCORES_KEY, {})[board];
  return Array.isArray(list) ? list : [];
}

export function bestScore(board: string): Score | null {
  return loadScores(board)[0] ?? null;
}

/** Records a score; returns its 0-based rank, or -1 if it didn't make the board. */
export function addScore(board: string, score: Score): number {
  const all = read<Record<string, Score[]>>(SCORES_KEY, {});
  const list = [...(all[board] ?? []), score].sort(sortScores).slice(0, MAX_SCORES);
  all[board] = list;
  write(SCORES_KEY, all);
  return list.indexOf(score);
}

export function clearScores(board: string): void {
  const all = read<Record<string, Score[]>>(SCORES_KEY, {});
  delete all[board];
  write(SCORES_KEY, all);
}

// ---------- Daily ----------

export interface DailyEntry {
  done: boolean; // false = started but not finished (quit or closed)
  time: number; // seconds incl. penalties
  misses: number;
}

type DailyLog = Record<string, DailyEntry>;

export function loadDaily(): DailyLog {
  return read<DailyLog>(DAILY_KEY, {});
}

export function saveDaily(key: string, entry: DailyEntry): void {
  write(DAILY_KEY, { ...loadDaily(), [key]: entry });
}

function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}

/** Consecutive completed days ending today (or yesterday, if today isn't done yet). */
export function dailyStreak(log: DailyLog, today: string = dateKey()): number {
  let day = log[today]?.done ? today : shiftDay(today, -1);
  let streak = 0;
  while (log[day]?.done) {
    streak++;
    day = shiftDay(day, -1);
  }
  return streak;
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
