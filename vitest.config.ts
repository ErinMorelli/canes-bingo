import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@app': path.resolve(import.meta.dirname, './src/client'),
      '@hooks': path.resolve(import.meta.dirname, './src/client/hooks'),
      '@components': path.resolve(import.meta.dirname, './src/client/components'),
      '@admin': path.resolve(import.meta.dirname, './src/client/admin'),
      '@context': path.resolve(import.meta.dirname, './src/client/context'),
      '@schema': path.resolve(import.meta.dirname, './src/schema'),
      '@server': path.resolve(import.meta.dirname, './src/server'),
    },
  },
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['src/client/**', 'jsdom'],
    ],
  },
});
