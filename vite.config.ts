import {defineConfig} from 'vitest/config';

export default defineConfig({
  server: {proxy: {'/api': {target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:8080', changeOrigin: true}}},
  test: {environment: 'jsdom', setupFiles: './src/test-setup.ts', restoreMocks: true},
});
