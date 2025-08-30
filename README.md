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

- **Svelte**: Frontend framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling and responsive design
- **localStorage**: High score persistence

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
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
```

## Project Structure

```
src/
├── lib/
│   ├── gameLogic.js      # Core game logic and validation
│   ├── highScores.js     # High score management
│   ├── GameConfig.svelte # Game settings component
│   ├── Keypad.svelte     # Mobile-optimized input keypad
│   └── HighScores.svelte # High scores display
├── App.svelte            # Main application component
├── main.js              # Application entry point
└── app.css              # Global styles (Tailwind)
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
