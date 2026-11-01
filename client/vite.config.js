import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative, so the build works from a GitHub Pages
// sub-path (username.github.io/repo-name/) without hardcoding the repo name.
export default defineConfig({
  plugins: [react()],
  base: './',
});
