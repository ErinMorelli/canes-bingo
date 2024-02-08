import { defineConfig } from 'vite';
import { vitePluginVersionMark } from 'vite-plugin-version-mark';

import react from '@vitejs/plugin-react';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

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
  plugins: [
    react(),
    vitePluginVersionMark({
      version: isProd
        ? process.env.HEROKU_RELEASE_COMMIT!.slice(0, 8)
        : undefined,
      ifGitSHA: !isProd,
      ifGlobal: false,
      ifLog: false,
    })
  ],
});
