import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      'next/font/google': path.resolve(rootDir, './src/test/mocks/nextFont.ts')
    }
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      /**
       * Without `all`, v8 only counts files some test imported, so untested
       * modules vanish from the denominator and the percentage reads far
       * higher than it is. `skipFull` then keeps the table down to the files
       * that still need work.
       */
      all: true,
      skipFull: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        '**/*.{test,spec}.{ts,tsx}',
        '**/*.config.{ts,mts,mjs}',
        '**/*.d.ts'
      ]
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          // Matches `next dev -p 4000`, so relative fetches resolve to the
          // same origin the MSW catalog handlers are registered against.
          environmentOptions: { jsdom: { url: 'http://localhost:4000' } },
          setupFiles: ['./vitest.setup.ts'],
          include: ['**/*.{test,spec}.{ts,tsx}'],
          exclude: ['e2e/**', 'node_modules/**', '.next/**']
        }
      }
    ]
  }
})
