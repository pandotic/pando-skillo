import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import prefixSelector from 'postcss-prefix-selector';

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
        prefixSelector({
          prefix: '.pando-skill-store',
          transform(prefix, selector, prefixedSelector) {
            // Replace body/html/:root with the scoping class itself
            if (['body', 'html', ':root', ':host'].includes(selector)) {
              return prefix;
            }
            // Keyframe selectors (from/to/%) should not be prefixed
            if (/^(from|to|\d+%)$/.test(selector)) {
              return selector;
            }
            return prefixedSelector;
          },
        }),
      ],
    },
  },
  build: {
    outDir: 'dist/widget',
    emptyOutDir: true,
    target: 'esnext',
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, 'src/widget/index.jsx'),
      formats: ['es'],
      fileName: () => 'skill-store.mjs',
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Name the CSS file predictably
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css';
          }
          return assetInfo.name;
        },
      },
    },
  },
});
