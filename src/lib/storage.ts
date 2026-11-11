import { DEFAULT_SETTINGS, sanitize, type Settings } from './game';

export interface Score {
  rounds: number;
  time: number; // total seconds spent on solved rounds
  date: number;
  settings: Settings;
}

const SETTINGS_KEY = 'factor:settings';
const SCORES_KEY = 'factor:scores';
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

export function loadSettings(): Settings {
  return sanitize({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(SETTINGS_KEY, {}) });
}

export function saveSettings(s: Settings): void {
  write(SETTINGS_KEY, s);
}

/** Scores are grouped by the settings that affect difficulty. */
export function boardKey(s: Settings): string {
  const rounds = s.roundLimit ?? '∞';
  return `${s.mode}:${s.min}-${s.max}:${s.timeLimit}s:${rounds}`;
}

export function boardLabel(s: Settings): string {
  const mode = s.mode === 'random' ? 'Random' : 'Sequential';
  const rounds = s.roundLimit ? `${s.roundLimit} rounds` : 'endless';
  return `${mode} · ${s.min}–${s.max} · ${s.timeLimit}s · ${rounds}`;
}

function sortScores(a: Score, b: Score): number {
  return b.rounds - a.rounds || a.time - b.time;
}

export function loadScores(s: Settings): Score[] {
  const all = read<Record<string, Score[]>>(SCORES_KEY, {});
  return Array.isArray(all[boardKey(s)]) ? all[boardKey(s)] : [];
}

/** Records a score; returns its 0-based rank, or -1 if it didn't make the board. */
export function addScore(score: Score): number {
  const all = read<Record<string, Score[]>>(SCORES_KEY, {});
  const key = boardKey(score.settings);
  const list = [...(all[key] ?? []), score].sort(sortScores).slice(0, MAX_SCORES);
  all[key] = list;
  write(SCORES_KEY, all);
  return list.indexOf(score);
}

export function clearScores(s: Settings): void {
  const all = read<Record<string, Score[]>>(SCORES_KEY, {});
  delete all[boardKey(s)];
  write(SCORES_KEY, all);
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
