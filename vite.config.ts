import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/client'),
      '@hooks': path.resolve(__dirname, './src/client/hooks'),
      '@components': path.resolve(__dirname, './src/client/components'),
      '@admin': path.resolve(__dirname, './src/client/admin'),
      '@context': path.resolve(__dirname, './src/client/context'),
      '@schema': path.resolve(__dirname, './src/schema'),
    },
  },
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
    ]
  }
});
