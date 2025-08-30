# Deployment Guide

## GitHub Pages Setup

### 1. Repository Settings

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Set **Source** to "GitHub Actions"

### 2. Update Configuration

Update `vite.config.js` to match your repository name:

```js
base: '/your-repo-name/', // Replace with actual repository name
```

### 3. Workflow Triggers

The deployment workflow triggers on:

- Push to `main` branch (automatic)
- Manual trigger from Actions tab
- Pull request merges to `main`

### 4. Build Process

The workflow performs:

1. **Code Quality Checks**:
   - TypeScript compilation (`npm run type-check`)
   - ESLint validation (`npm run lint:check`)
   - Prettier formatting check (`npm run format:check`)
2. **Build**: Production build with Vite (`npm run build`)
3. **Deploy**: Upload to GitHub Pages

### 5. Deployment URL

Your game will be available at:

```
https://[username].github.io/[repository-name]/
```

## Badge for README

Add this badge to show deployment status:

```markdown
[![Deploy to GitHub Pages](https://github.com/[username]/[repository-name]/actions/workflows/deploy.yml/badge.svg)](https://github.com/[username]/[repository-name]/actions/workflows/deploy.yml)
```

## Troubleshooting

### Common Issues:

1. **404 on deployment**: Check base path in `vite.config.js`
2. **Build fails**: Run quality checks locally first
3. **Assets not loading**: Ensure `.nojekyll` file exists in public folder

### Debugging:

- Check Actions tab for build logs
- Verify all npm scripts work locally
- Test production build with `npm run preview`
