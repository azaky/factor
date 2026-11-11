# Factor - Prime Factorization Game

A web-based factorization game where players must quickly enter the prime factorization of given numbers.

## Game Rules

- Players are given a number in each round and must enter its prime factorization
- Numbers must be broken down to prime powers (e.g., 12 → 2^2\*3)
- Order doesn't matter (3\*2^2 is acceptable)
- First powers can be explicit (3^1*2^2) or implicit (3*2^2)
- Exception: for the number 1, entering "1" is acceptable
- Invalid formats: 6*2, 4*3, 2*2*3, 1*2^2*3 (non-prime factors)
- Time limit: 30 seconds per round (configurable)

## Game Modes

### Sequential Mode

- Numbers increment from a starting to ending number
- Configurable range (e.g., 1 to 100)
- Game ends when reaching the end number

### Random Mode

- Random numbers within a configurable range
- Optional fixed seed for repeatable games (otherwise a new seed each game)
- Can be endless (sudden death) or have round limits
- Configurable between any two numbers (e.g., 1000-9999)

## Scoring

Score is based on:

- Number of rounds completed
- Total time taken to complete rounds
- Average time per round

## Features

- **Fits the screen**: The game screen fills the viewport (no scrolling) on phones and desktop
- **High Scores**: Local storage saves top 10 scores per game mode
- **Configurable Settings**:
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
│   ├── storage.ts            # Settings + high scores (localStorage)
│   ├── Play.svelte           # Game screen (timer, input, keypad)
│   ├── Keypad.svelte         # On-screen keypad
│   ├── Expr.svelte           # Renders 2^3*5 as 2³ × 5
│   ├── SettingsView.svelte   # Settings screen
│   └── ScoresView.svelte     # High scores screen
├── App.svelte                # Screen routing, menu, game-over
├── main.ts                   # Entry point
└── app.css                   # Design tokens and shared layout styles
```

## Controls

- On-screen keypad, or the physical keyboard: digits, `*` (or `x`), `^`, Backspace, Enter
- Esc quits a running game; Enter starts a new game from the menu or game-over screen

High scores are kept per combination of mode, range, time limit and round limit.

## License

MIT License - see LICENSE file for details
