/**
 * Game logic for the factorization game
 */

export interface FactorsMap {
  [prime: number]: number;
}

export interface GameConfig {
  gameMode: 'sequential' | 'random';
  startNumber: number;
  endNumber: number;
  timeLimit: number;
  randomSeed: number;
  autoRandomSeed: boolean; // If true, generates new seed on each game start
  roundLimit: number | null;
}

export interface GameState {
  currentRound: number;
  currentNumber: number;
  score: number;
  totalTime: number;
  gameOver: boolean;
  remainingTime: number;
}

/**
 * Get prime factors of a number
 */
export function getPrimeFactors(n: number): FactorsMap {
  if (n === 1) return { 1: 1 };

  const factors: FactorsMap = {};
  let num = n;

  // Check for factor 2
  while (num % 2 === 0) {
    factors[2] = (factors[2] || 0) + 1;
    num = num / 2;
  }

  // Check for odd factors from 3 onwards
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    while (num % i === 0) {
      factors[i] = (factors[i] || 0) + 1;
      num = num / i;
    }
  }

  // If num is still greater than 2, it's a prime
  if (num > 2) {
    factors[num] = 1;
  }

  return factors;
}

/**
 * Parse user input like "2^3*5^2" into factors object
 */
export function parseUserInput(input: string): FactorsMap | null {
  if (!input.trim()) return null;

  // Special case for "1"
  if (input.trim() === '1') {
    return { 1: 1 };
  }

  try {
    const factors: FactorsMap = {};

    // Split by * to get individual factor terms
    const terms = input.split('*');

    for (const term of terms) {
      const trimmedTerm = term.trim();

      if (trimmedTerm.includes('^')) {
        // Handle base^power format
        const [base, power] = trimmedTerm.split('^');
        const baseNum = parseInt(base.trim());
        const powerNum = parseInt(power.trim());

        if (isNaN(baseNum) || isNaN(powerNum) || baseNum <= 0 || powerNum <= 0) {
          return null;
        }

        factors[baseNum] = (factors[baseNum] || 0) + powerNum;
      } else {
        // Handle single number (power of 1)
        const num = parseInt(trimmedTerm);
        if (isNaN(num) || num <= 0) {
          return null;
        }
        factors[num] = (factors[num] || 0) + 1;
      }
    }

    return factors;
  } catch (error) {
    return null;
  }
}

/**
 * Check if two factor objects are equivalent
 */
export function areFactorsEqual(factors1: FactorsMap, factors2: FactorsMap): boolean {
  const keys1 = Object.keys(factors1);
  const keys2 = Object.keys(factors2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    const numKey = parseInt(key, 10);
    if (factors1[numKey] !== factors2[numKey]) return false;
  }

  return true;
}

/**
 * Validate if user input is correct for a given number
 */
/**
 * Format factors map into a readable string (e.g., "2^3*5" for {2: 3, 5: 1})
 */
export function formatFactorization(factors: FactorsMap): string {
  if (factors[1]) return '1';
  
  const terms: string[] = [];
  
    for (const [prime] of Object.entries(factors)) {
    const primeNum = parseInt(prime);
    const powerNum = factors[primeNum];

    if (powerNum === 1) {
      terms.push(prime);
    } else {
      terms.push(`${prime}^${powerNum}`);
    }
  }
  
  return terms.join('*');
}

/**
 * Get the correct factorization string for a number
 */
export function getCorrectFactorization(targetNumber: number): string {
  const factors = getPrimeFactors(targetNumber);
  return formatFactorization(factors);
}

export function validateFactorization(targetNumber: number, userInput: string): boolean {
  const correctFactors = getPrimeFactors(targetNumber);
  const userFactors = parseUserInput(userInput);

  if (!userFactors) return false;

  // For the special case of 1, allow "1" as input
  if (targetNumber === 1 && userInput.trim() === '1') {
    return true;
  }

  // For numbers other than 1, check if all factors in user input are prime
  if (targetNumber !== 1) {
    for (const factor in userFactors) {
      const num = parseInt(factor);
      if (num === 1) {
        // Factor of 1 is only allowed for the number 1
        return false;
      }
      if (!isPrime(num)) {
        return false;
      }
    }
  }

  return areFactorsEqual(correctFactors, userFactors);
}

/**
 * Check if a number is prime
 */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;

  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }

  return true;
}

/**
 * Seeded Random Number Generator class for deterministic sequences
 */
class SeededRandom {
  private seed: number;

  constructor(initialSeed: number) {
    this.seed = initialSeed;
  }

  /**
   * Generate next random number in sequence
   */
  next(): number {
    // Simple linear congruential generator
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    const random = this.next();
    return Math.floor(random * (max - min + 1)) + min;
  }

  /**
   * Reset the seed
   */
  setSeed(newSeed: number): void {
    this.seed = newSeed;
  }
}

/**
 * Game state management
 */
export class FactorGame {
  public gameMode: 'sequential' | 'random';
  public startNumber: number;
  public endNumber: number;
  public timeLimit: number;
  public randomSeed: number;
  public autoRandomSeed: boolean;
  public roundLimit: number | null;
  public currentRound: number = 0;
  public currentNumber: number = 0;
  public score: number = 0;
  public totalTime: number = 0;
  public gameOver: boolean = false;
  public roundStartTime: number | null = null;
  private randomGenerator: SeededRandom;

  constructor(config: Partial<GameConfig> = {}) {
    this.gameMode = config.gameMode || 'sequential'; // 'sequential' or 'random'
    this.startNumber = config.startNumber || 1;
    this.endNumber = config.endNumber || 100;
    this.timeLimit = config.timeLimit || 30; // seconds
    this.randomSeed = config.randomSeed || Date.now();
    this.autoRandomSeed = config.autoRandomSeed || false;
    this.roundLimit = config.roundLimit || null; // null for endless

    // Initialize random generator
    this.randomGenerator = new SeededRandom(this.randomSeed);

    this.reset();
  }

  reset(): void {
    this.currentRound = 1;
    this.currentNumber = this.gameMode === 'sequential' ? this.startNumber : this.startNumber;
    this.score = 0;
    this.totalTime = 0;
    this.gameOver = false;
    this.roundStartTime = null;

    // Generate new seed if auto-random is enabled
    if (this.autoRandomSeed) {
      this.randomSeed = Date.now();
    }

    // Reset random generator with current seed
    this.randomGenerator.setSeed(this.randomSeed);

    if (this.gameMode === 'random') {
      this.generateRandomNumber();
    }
  }

  generateRandomNumber(): void {
    this.currentNumber = this.randomGenerator.nextInt(this.startNumber, this.endNumber);
  }

  startRound(): void {
    this.roundStartTime = Date.now();
  }

  submitAnswer(userInput: string): boolean {
    if (this.gameOver || !this.roundStartTime) return false;

    const roundTime = (Date.now() - this.roundStartTime) / 1000;
    const isCorrect = validateFactorization(this.currentNumber, userInput);

    if (isCorrect) {
      this.score++;
      this.totalTime += roundTime;
      return this.nextRound();
    } else {
      this.gameOver = true;
      return false;
    }
  }

  nextRound(): boolean {
    this.currentRound++;

    // Check if game should end
    if (this.gameMode === 'sequential' && this.currentNumber >= this.endNumber) {
      this.gameOver = true;
      return true;
    }

    if (this.roundLimit && this.currentRound > this.roundLimit) {
      this.gameOver = true;
      return true;
    }

    // Generate next number
    if (this.gameMode === 'sequential') {
      this.currentNumber++;
    } else {
      this.generateRandomNumber();
    }

    this.roundStartTime = null;
    return true;
  }

  checkTimeLimit(): boolean {
    if (!this.roundStartTime) return true;

    const elapsed = (Date.now() - this.roundStartTime) / 1000;
    if (elapsed >= this.timeLimit) {
      this.gameOver = true;
      return false;
    }

    return true;
  }

  getRemainingTime(): number {
    if (!this.roundStartTime) return this.timeLimit;

    const elapsed = (Date.now() - this.roundStartTime) / 1000;
    return Math.max(0, this.timeLimit - elapsed);
  }

  getGameState(): GameState {
    return {
      currentRound: this.currentRound,
      currentNumber: this.currentNumber,
      score: this.score,
      totalTime: this.totalTime,
      gameOver: this.gameOver,
      remainingTime: this.getRemainingTime(),
    };
  }
}
