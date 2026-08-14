import { defineConfig } from 'vitest/config'

// Takes precedence over vite.config.ts, whose root is the demo page.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
})
