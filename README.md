# Factor - Prime Factorization Game

A web-based factorization game where players must quickly enter the prime factorization of given numbers.

## Game Rules

- Players are given a number in each round and must enter its prime factorization
- Numbers must be broken down to prime powers (e.g., 12 → 2^2\*3)
- Order doesn't matter (3\*2^2 is acceptable)
- First powers can be explicit (3^1*2^2) or implicit (3*2^2)
- Exception: for the number 1, entering "1" is acceptable
- Invalid formats: 6*2, 4*3, 2*2*3, 1*2^2*3 (non-prime factors)

## Game Modes

### Daily

- The same 10 numbers for everyone on a given date, getting harder through the set and ending with a "boss" (a product of two two-digit primes)
- Numbers come from a seed derived from the local date, so it needs no server
- Timed with a stopwatch; a wrong answer adds 10s and you retry the same number
- One attempt per day: starting counts, so quitting can't be used to preview the numbers
- Tracks your streak, shows the day's answers afterwards, and has a Share button

### Blitz

- 60 seconds for the whole run; solve as many as you can
- Each correct answer adds 2s; a wrong answer costs 5s and moves on to the next number
- Two-digit numbers at first, then three digits

### Survival

- Each level adds difficulty: numbers grow by one digit every 10 levels (10–100 → 100–1000 → …)
- Time per number shrinks from 30s to 15s by level 30
- A wrong answer or a timeout ends the run; your score is the number of levels cleared

### Classic

- Configurable: sequential or random order, number range, seconds per round, round limit and an optional fixed seed
- A wrong answer or a timeout ends the game

### Practice

- Untimed and endless, with Easy (2-digit), Medium (3-digit) and Hard (4-digit) numbers
- Factor step by step: enter any prime powers that divide the number (e.g. `3^2` for 432) and the number is divided by them, so 432 becomes 48 while `432 = 3² ×` is kept above it
- Finish by entering the last factor; the remaining number has to be typed even when it's prime
- A rejected step says why (not prime, or doesn't divide) without giving the answer away
- Hint gives a random prime that divides the current number; Give up shows the full answer
- No scores

## Features

- **Fits the screen**: The game screen fills the viewport (no scrolling) on phones and desktop
- **High Scores**: Local storage saves top 10 scores per game mode
- **Configurable Classic mode**:
  - Game mode (sequential/random)
  - Number ranges
  - Time limits
  - Random seeds
  - Round limits
- **Real-time Timer**: Visual countdown showing remaining time
- **Responsive Design**: Works on mobile and desktop

## Technology Stack

- **Svelte 5** + **TypeScript**, built with **Vite**
- Plain CSS (no framework), light and dark themes via `prefers-color-scheme`
- **localStorage** for settings and high scores
- **GitHub Actions** deploys to GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v18 or higher, v24 recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd factor

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Code quality commands
npm run type-check    # TypeScript type checking
npm run lint          # ESLint with auto-fix
npm run lint:check    # ESLint check only
npm run format        # Format with Prettier
npm run format:check  # Check Prettier formatting
```

## 🚀 Live Demo

The game is automatically deployed to GitHub Pages: **[Play Factor Game](https://your-username.github.io/factor/)**

### Deployment

The project uses GitHub Actions for automated deployment:

1. **Automatic**: Every push to `main` branch triggers deployment
2. **Manual**: Can be triggered from the Actions tab
3. **Quality Checks**: Runs TypeScript, ESLint, and Prettier checks before deployment

#### Setting Up GitHub Pages

1. Fork or clone this repository
2. Go to repository **Settings** → **Pages**
3. Set **Source** to "GitHub Actions"
4. Update `vite.config.js` base path to match your repository name:
   ```js
   base: '/your-repo-name/', // Replace with your actual repo name
   ```
5. Push to `main` branch - deployment will start automatically

## Project Structure

```
src/
├── lib/
│   ├── game.ts               # Factorization, validation, seeded number source, settings
│   ├── practice.ts           # Practice: number choice, step checking, hints
│   ├── Practice.svelte       # Practice screen
│   ├── PracticeDone.svelte   # Practice finished / gave-up screen
│   ├── modes.ts              # Rules for Daily, Blitz, Survival and Classic; difficulty curve
│   ├── storage.ts            # Settings + high scores (localStorage)
│   ├── Play.svelte           # Game screen; runs any mode's rules
│   ├── GameOver.svelte       # Result screen for Blitz, Survival and Classic
│   ├── DailyResult.svelte    # Daily result, streak, answers, share
│   ├── Keypad.svelte         # On-screen keypad
│   ├── Expr.svelte           # Renders 2^3*5 as 2³ × 5
│   ├── SettingsView.svelte   # Classic settings
│   └── ScoresView.svelte     # High scores screen
├── App.svelte                # Screen routing and the mode menu
├── main.ts                   # Entry point
└── app.css                   # Design tokens and shared layout styles
```

## Controls

- On-screen keypad, or the physical keyboard: digits, `*` (or `x`), `^`, Backspace, Enter
- Esc quits a running game; Enter plays again from the game-over screen

Blitz and Survival each have one high-score board. Classic keeps a separate board for each combination of settings.

## License

MIT License - see LICENSE file for details
