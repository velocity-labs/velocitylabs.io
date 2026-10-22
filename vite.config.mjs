import { defineConfig } from 'vite';
import ViteRuby from 'vite-plugin-ruby';
import path from 'path';

export default defineConfig({
  plugins: [ViteRuby()],
  resolve: {
    alias: {
      '@images': path.resolve(import.meta.dirname, '_frontend/images')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        loadPaths: [path.resolve(import.meta.dirname, '_frontend/stylesheets')]
      }
    }
  }
});
