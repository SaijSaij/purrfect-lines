import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
// With file extensions: Vite loads this config, and the files it imports, without a bundler.
import { catHeadMarkup } from './src/render/decor.ts';

/**
 * Puts the cat head into index.html as the favicon, as an inline SVG data URI
 * (A55). It is built from decor.ts, so its colors stay in palette.ts only.
 */
function favicon(): Plugin {
  return {
    name: 'purrfect-lines-favicon',
    transformIndexHtml: () => [
      {
        tag: 'link',
        attrs: { rel: 'icon', type: 'image/svg+xml', href: `data:image/svg+xml,${encodeURIComponent(catHeadMarkup())}` },
        injectTo: 'head',
      },
    ],
  };
}

export default defineConfig({
  // Relative paths in the build, so it runs under /purrfect-lines/ on GitHub
  // Pages as well as under / with `npm run preview` (A48).
  base: './',
  plugins: [favicon()],
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
