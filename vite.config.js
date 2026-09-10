import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Permite que funcione tanto en local como en GitHub Pages
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
