import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    // Flat config does not read .gitignore, so generated test artefacts have to
    // be listed here as well or `eslint .` reports on the HTML coverage report.
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'scripts/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**'
    ]
  }
]

export default eslintConfig
