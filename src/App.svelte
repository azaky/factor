<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    FactorGame,
    type GameConfig,
    type GameState,
    getCorrectFactorization,
  } from './lib/gameLogic';
  import { addHighScore, getHighScores, formatTime, type ScoreEntry } from './lib/highScores';
  import GameConfigComponent from './lib/GameConfig.svelte';
  import Keypad from './lib/Keypad.svelte';
  import HighScores from './lib/HighScores.svelte';

  let gameState: 'menu' | 'config' | 'playing' | 'gameOver' | 'highScores' = 'menu';
  let game: FactorGame | null = null;
  let userInput: string = '';
  let currentGameState: GameState = {
    currentRound: 0,
    currentNumber: 0,
    score: 0,
    totalTime: 0,
    gameOver: false,
    remainingTime: 0,
  };
  let timer: ReturnType<typeof setInterval> | null = null;
  let isNewHighScore: boolean = false;
  let lastFailedNumber: number | null = null;

  // Game configuration
  let gameConfig: GameConfig = {
    gameMode: 'random',
    startNumber: 100,
    endNumber: 999,
    timeLimit: 30,
    randomSeed: Date.now(),
    autoRandomSeed: true,
    roundLimit: null,
  };

  onMount(() => {
    // Initialize with default config
    updateGameState();

    // Add keyboard event listener
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }

    // Remove keyboard event listener
    window.removeEventListener('keydown', handleKeydown);
  });

  function handleKeydown(event: KeyboardEvent): void {
    // Only handle keyboard input during gameplay
    if (gameState !== 'playing') return;

    const key = event.key;

    // Prevent default behavior for keys we handle
    if (/^[0-9*^]$/.test(key) || key === 'Backspace' || key === 'Enter') {
      event.preventDefault();
    }

    // Handle number keys
    if (/^[0-9]$/.test(key)) {
      handleKeypadInput(key);
    }
    // Handle operators
    else if (key === '*') {
      handleKeypadInput('*');
    } else if (key === '^' || (key === '6' && event.shiftKey)) {
      // ^ or Shift+6
      handleKeypadInput('^');
    }
    // Handle backspace
    else if (key === 'Backspace') {
      handleKeypadInput('backspace');
    }
    // Handle enter
    else if (key === 'Enter') {
      handleKeypadInput('enter');
    }
  }

  function startGame(): void {
    game = new FactorGame(gameConfig);
    gameState = 'playing';
    userInput = '';
    isNewHighScore = false;
    lastFailedNumber = null;
    startNewRound();
  }

  function startNewRound(): void {
    game.startRound();
    updateGameState();

    // Start timer for real-time updates
    timer = setInterval(() => {
      if (!game.checkTimeLimit()) {
        endGame();
      }
      updateGameState();
    }, 100);
  }

  function updateGameState(): void {
    if (game) {
      currentGameState = game.getGameState();
    }
  }

  function submitAnswer(): void {
    if (!game || gameState !== 'playing' || !userInput.trim()) return;

    const success = game.submitAnswer(userInput);
    userInput = '';

    if (game.gameOver) {
      endGame();
    } else if (success) {
      // Continue to next round
      startNewRound();
    }
  }

  function endGame(): void {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    updateGameState();

    // Capture the last failed number for showing correct factorization
    lastFailedNumber = currentGameState.currentNumber;

    // Check for high score
    if (currentGameState.score > 0) {
      const scoreData = {
        score: currentGameState.score,
        totalTime: currentGameState.totalTime,
        gameMode: gameConfig.gameMode,
        config: { ...gameConfig },
      };

      isNewHighScore = addHighScore(gameConfig.gameMode, scoreData);
    }

    gameState = 'gameOver';
  }

  function handleKeypadInput(value: string): void {
    if (value === 'backspace') {
      userInput = userInput.slice(0, -1);
    } else if (value === 'enter') {
      submitAnswer();
    } else {
      userInput += value;
    }
  }

  function goToMenu(): void {
    gameState = 'menu';
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function goToConfig(): void {
    gameState = 'config';
  }

  function goToHighScores(): void {
    gameState = 'highScores';
  }

  function handleConfigSave(config: GameConfig): void {
    gameConfig = { ...config };
    gameState = 'menu';
  }
</script>

<main class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
  <div class="container mx-auto px-4 py-8 max-w-md">
    {#if gameState === 'menu'}
      <div class="text-center space-y-8">
        <div class="mb-12">
          <h1
            class="text-6xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            Factor
          </h1>
          <p class="text-xl text-blue-200 mt-4 font-medium">Prime factorization game</p>
          <div
            class="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mt-4 rounded-full"
          ></div>
        </div>

        <div class="space-y-4">
          <button
            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            on:click={startGame}
          >
            <div class="flex items-center justify-center space-x-2">
              <span>🎯</span>
              <span>Start Game</span>
            </div>
          </button>

          <button
            class="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            on:click={goToConfig}
          >
            <div class="flex items-center justify-center space-x-2">
              <span>⚙️</span>
              <span>Settings</span>
            </div>
          </button>

          <button
            class="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            on:click={goToHighScores}
          >
            <div class="flex items-center justify-center space-x-2">
              <span>🏆</span>
              <span>High Scores</span>
            </div>
          </button>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-blue-300 font-medium">Mode</div>
              <div class="font-bold capitalize">{gameConfig.gameMode}</div>
            </div>
            <div>
              <div class="text-blue-300 font-medium">Time Limit</div>
              <div class="font-bold">{gameConfig.timeLimit}s</div>
            </div>
          </div>
        </div>
      </div>
    {:else if gameState === 'config'}
      <GameConfigComponent
        config={gameConfig}
        on:save={e => handleConfigSave(e.detail)}
        on:cancel={() => (gameState = 'menu')}
      />
    {:else if gameState === 'highScores'}
      <HighScores gameMode={gameConfig.gameMode} on:back={() => (gameState = 'menu')} />
    {:else if gameState === 'playing'}
      <div class="space-y-6">
        <!-- Game Header -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-sm text-blue-300 font-medium">Round</div>
              <div class="text-2xl font-bold text-white">{currentGameState.currentRound}</div>
            </div>
            <div>
              <div class="text-sm text-blue-300 font-medium">Score</div>
              <div class="text-2xl font-bold text-green-400">{currentGameState.score}</div>
            </div>
            <div>
              <div class="text-sm text-blue-300 font-medium">Time</div>
              <div
                class="text-2xl font-bold {Math.ceil(currentGameState.remainingTime) <= 5
                  ? 'text-red-400 animate-pulse'
                  : 'text-yellow-400'}"
              >
                {Math.ceil(currentGameState.remainingTime)}s
              </div>
            </div>
          </div>
        </div>

        <!-- Current Number -->
        <div
          class="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-8 text-center border border-white/30 shadow-xl"
        >
          <p class="text-lg text-blue-200 mb-4 font-medium">Factor this number:</p>
          <div
            class="text-7xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mb-6"
          >
            {currentGameState.currentNumber}
          </div>
          <p class="text-sm text-blue-300">Enter prime factorization (e.g., 2^2*3)</p>
        </div>

        <!-- Input Display -->
        <div class="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div
            class="text-right text-2xl font-mono min-h-[3rem] text-white flex items-center justify-end"
          >
            <span
              class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              {userInput || ''}
            </span>
            <span class="w-0.5 h-8 bg-blue-400 ml-1 animate-pulse"></span>
          </div>
        </div>

        <!-- Keypad -->
        <Keypad on:input={e => handleKeypadInput(e.detail)} />

        <!-- Game Controls -->
        <div class="flex gap-4">
          <button
            class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            on:click={goToMenu}
          >
            <div class="flex items-center justify-center space-x-2">
              <span>🚪</span>
              <span>Quit</span>
            </div>
          </button>
        </div>
      </div>
    {:else if gameState === 'gameOver'}
      <div class="text-center space-y-8">
        <!-- Game Over Header -->
        <div class="relative">
          <h2
            class="text-5xl font-black bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent"
          >
            Game Over!
          </h2>
          {#if isNewHighScore}
            <div class="absolute -top-4 -right-4 text-4xl animate-bounce">🎉</div>
          {/if}
        </div>

        {#if isNewHighScore}
          <div
            class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-xl p-6 backdrop-blur-sm"
          >
            <div class="text-2xl font-bold text-yellow-300 mb-2">🏆 New High Score!</div>
            <p class="text-yellow-200">Congratulations on your achievement!</p>
          </div>
        {/if}

        <!-- Show Correct Answer -->
        {#if lastFailedNumber !== null}
          <div class="bg-red-500/20 border border-red-400/50 rounded-xl p-6 backdrop-blur-sm">
            <div class="text-center">
              <div class="text-lg font-bold text-red-300 mb-2">📚 Correct Answer</div>
              <div class="text-sm text-red-200 mb-3">
                The correct factorization for {lastFailedNumber} was:
              </div>
              <div
                class="text-2xl font-black bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent font-mono"
              >
                {lastFailedNumber} = {getCorrectFactorization(lastFailedNumber)}
              </div>
            </div>
          </div>
        {/if}

        <!-- Score Display -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 space-y-6">
          <div class="text-center">
            <div class="text-sm text-blue-300 font-medium mb-2">Final Score</div>
            <div
              class="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
            >
              {currentGameState.score}
            </div>
            <div class="text-sm text-blue-300">rounds completed</div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 text-center">
            <div>
              <div class="text-sm text-blue-300 font-medium">Total Time</div>
              <div class="text-xl font-bold text-white">
                {formatTime(currentGameState.totalTime)}
              </div>
            </div>
            {#if currentGameState.score > 0}
              <div>
                <div class="text-sm text-blue-300 font-medium">Average</div>
                <div class="text-xl font-bold text-white">
                  {(currentGameState.totalTime / currentGameState.score).toFixed(1)}s
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-4">
          <button
            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            on:click={startGame}
          >
            <div class="flex items-center justify-center space-x-2">
              <span>🎯</span>
              <span>Play Again</span>
            </div>
          </button>

          <button
            class="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            on:click={goToMenu}
          >
            <div class="flex items-center justify-center space-x-2">
              <span>🏠</span>
              <span>Main Menu</span>
            </div>
          </button>
        </div>
      </div>
    {/if}
  </div>
</main>
