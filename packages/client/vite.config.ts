import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@zero-networks/engine': fileURLToPath(new URL('../engine/src/index.ts', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['@zero-networks/engine'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
