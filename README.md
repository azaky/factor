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
- Deterministic randomness using seeds for repeatable games
- Can be endless (sudden death) or have round limits
- Configurable between any two numbers (e.g., 1000-9999)

## Scoring

Score is based on:

- Number of rounds completed
- Total time taken to complete rounds
- Average time per round

## Features

- **Mobile-Optimized**: Touch-friendly keypad with numbers, \*, ^, backspace, and enter
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

- **Svelte**: Frontend framework for reactive UI
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety and better development experience
- **ESLint & Prettier**: Code quality and formatting
- **GitHub Actions**: Automated deployment
- **localStorage**: High score persistence

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
│   ├── gameLogic.ts      # Core game logic and validation (TypeScript)
│   ├── highScores.ts     # High score management (TypeScript)
│   ├── GameConfig.svelte # Game settings component
│   ├── Keypad.svelte     # Mobile-optimized input keypad
│   └── HighScores.svelte # High scores display
├── App.svelte            # Main application component
├── main.js              # Application entry point
└── app.css              # Global styles (Tailwind + custom)

.github/
└── workflows/
    └── deploy.yml        # GitHub Actions deployment workflow

Configuration:
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.js        # Vite build configuration
├── .eslintrc.json        # ESLint configuration
└── .prettierrc           # Prettier configuration
```

## Game Logic

### Prime Factorization Validation

- Validates user input format (e.g., "2^3\*5^2")
- Checks that all factors are prime numbers
- Compares against correct prime factorization
- Supports various input formats

### Random Number Generation

- Uses Linear Congruential Generator for deterministic randomness
- Seed-based generation allows for repeatable game sequences
- Configurable range support

## Development

### Adding New Features

1. Game logic goes in `src/lib/gameLogic.js`
2. UI components in `src/lib/`
3. Update main app state in `App.svelte`

### Testing

The game includes comprehensive factorization validation that handles:

- Prime number verification
- Input parsing and validation
- Edge cases (number 1, single primes, etc.)

## Future Enhancements

- Online leaderboards
- Multiplayer modes
- Achievement system
- Practice mode with hints
- Statistics tracking
- Sound effects and animations

## License

MIT License - see LICENSE file for details
