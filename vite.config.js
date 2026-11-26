import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite is the build tool. It serves the app instantly in development (`npm run dev`)
// and bundles a static site for production (`npm run build`) that Vercel can host for free.
// Vitest (the test runner) reads this same config, so the scoring tests run with no extra setup.
export default defineConfig({
  plugins: [react()],
  test: {
    // Our tests only exercise pure functions in scoring.js, so no browser/DOM is needed.
    environment: 'node',
  },
});
