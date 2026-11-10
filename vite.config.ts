import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // File change events do not cross the Windows bind mount into the container.
    watch: { usePolling: true },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
