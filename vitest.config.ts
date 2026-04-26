import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/client'),
      '@hooks': path.resolve(__dirname, './src/client/hooks'),
      '@components': path.resolve(__dirname, './src/client/components'),
      '@admin': path.resolve(__dirname, './src/client/admin'),
      '@context': path.resolve(__dirname, './src/client/context'),
      '@schema': path.resolve(__dirname, './src/schema'),
      '@server': path.resolve(__dirname, './src/server'),
    },
  },
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['src/client/**', 'jsdom'],
    ],
  },
});
