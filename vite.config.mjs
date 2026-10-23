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
  build: {
    // Small font subsets (e.g. Greek Extended) would otherwise be inlined as
    // base64 into the render-blocking CSS; as files they load only if used
    assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined)
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        loadPaths: [path.resolve(import.meta.dirname, '_frontend/stylesheets')],
        // Bootstrap 5's Sass still uses @import and older functions
        quietDeps: true,
        silenceDeprecations: ['import']
      }
    }
  }
});
