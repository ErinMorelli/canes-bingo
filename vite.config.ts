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
  build: {
    // Disable the inline modulepreload polyfill so no unaccounted-for inline
    // scripts appear in production (which would violate the strict CSP).
    // All target browsers support <link rel="modulepreload"> natively.
    modulePreload: { polyfill: false },
    // antd is ~280 kB gzipped and can't be split further; raise the limit to avoid false-positive noise.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'vendor-antd': ['antd', '@ant-design/colors'],
          'vendor-icons': ['@ant-design/icons'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    allowedHosts: [
      'localhost',
    ]
  }
});
