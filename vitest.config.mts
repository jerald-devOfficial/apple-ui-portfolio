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
       * Vitest 4 dropped `coverage.all`. `include` is what pulls untested
       * files into the denominator so the percentage is not only the modules
       * a test imported. `skipFull` keeps the table down to files that still
       * need work.
       */
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
