import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/factor/', // GitHub Pages base path - replace 'factor' with your repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
