/**
 * High score management using localStorage
 */

export interface ScoreEntry {
  score: number;
  totalTime: number;
  gameMode: 'sequential' | 'random';
  config: any;
  timestamp: number;
  id: string;
}

const HIGH_SCORES_KEY = 'factor-game-scores';
const MAX_HIGH_SCORES = 10;

/**
 * Get high scores from localStorage
 */
export function getHighScores(gameMode: 'sequential' | 'random'): ScoreEntry[] {
  try {
    const scores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '{}');
    return scores[gameMode] || [];
  } catch (error) {
    console.error('Error loading high scores:', error);
    return [];
  }
}

/**
 * Save high scores to localStorage
 */
function saveHighScores(gameMode: 'sequential' | 'random', scores: ScoreEntry[]): void {
  try {
    const allScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '{}');
    allScores[gameMode] = scores;
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(allScores));
  } catch (error) {
    console.error('Error saving high scores:', error);
  }
}

/**
 * Add a new score and return if it's a high score
 */
export function addHighScore(
  gameMode: 'sequential' | 'random',
  newScore: Omit<ScoreEntry, 'timestamp' | 'id'>
): boolean {
  const scores = getHighScores(gameMode);

  // Create score object with timestamp
  const scoreEntry = {
    ...newScore,
    timestamp: Date.now(),
    id: Math.random().toString(36).substr(2, 9),
  };

  scores.push(scoreEntry);

  // Sort by score (descending), then by time (ascending for ties)
  scores.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score; // Higher score first
    }
    return a.totalTime - b.totalTime; // Lower time first for same score
  });

  // Keep only top scores
  const topScores = scores.slice(0, MAX_HIGH_SCORES);
  saveHighScores(gameMode, topScores);

  // Check if the new score made it to the high scores
  return topScores.some(score => score.id === scoreEntry.id);
}

/**
 * Clear all high scores
 */
export function clearHighScores(gameMode: 'sequential' | 'random' | null = null): void {
  try {
    if (gameMode) {
      const allScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '{}');
      delete allScores[gameMode];
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(allScores));
    } else {
      localStorage.removeItem(HIGH_SCORES_KEY);
    }
  } catch (error) {
    console.error('Error clearing high scores:', error);
  }
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get score summary text
 */
export function getScoreSummary(score: ScoreEntry): string {
  const avgTime = score.totalTime / score.score;
  return `${score.score} rounds in ${formatTime(score.totalTime)} (avg: ${avgTime.toFixed(1)}s/round)`;
}
