import { defineConfig } from 'vite';
import ViteRuby from 'vite-plugin-ruby';
import path from 'path';

export default defineConfig({
  plugins: [ViteRuby()],
  resolve: {
    alias: {
      '@images': path.resolve(__dirname, '_frontend/images')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        loadPaths: [path.resolve(__dirname, '_frontend/stylesheets')]
      }
    }
  }
});
