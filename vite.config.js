import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages deployment, set the base to your repo name
  // Example: base: '/your-repo-name/'
  // Leave as '/' for local development or custom domain
  base: '/',
})
