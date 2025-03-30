import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/client'),
      '@hooks': path.resolve(__dirname, './src/client/hooks'),
      '@slices': path.resolve(__dirname, './src/client/slices'),
      '@components': path.resolve(__dirname, './src/client/components'),
      '@admin': path.resolve(__dirname, './src/client/admin'),
    },
  },
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      'test-chamber-003.local'
    ]
  }
});
