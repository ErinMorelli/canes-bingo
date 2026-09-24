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
        // Rolldown (Vite 8) replaces the object form of `manualChunks` with
        // `codeSplitting.groups`. Higher priority wins when patterns overlap.
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              priority: 40,
            },
            {
              name: 'vendor-icons',
              test: /node_modules[\\/]@ant-design[\\/]icons(-svg)?[\\/]/,
              priority: 30,
            },
            {
              name: 'vendor-antd',
              test: /node_modules[\\/](antd|@ant-design[\\/]colors)[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-query',
              test: /node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
              priority: 10,
            },
          ],
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
