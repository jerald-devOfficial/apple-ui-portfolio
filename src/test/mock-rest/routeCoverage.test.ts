import { apiFilePathToRoute, MOCK_REST_ROUTES } from '@/test/mock-rest/catalog'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Routes deliberately left out of the fixture catalog.
 *
 * `/api/auth/:...nextauth` is the NextAuth v5 handler — an OAuth redirect
 * dance that only Playwright can exercise meaningfully.
 */
const EXCLUDED_ROUTES = ['/api/auth/:...nextauth']

const API_DIR = path.resolve(process.cwd(), 'src/app/api')

const collectRouteFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) return collectRouteFiles(entryPath)
    return entry.name === 'route.ts' ? [entryPath] : []
  })

const implementedRoutes = collectRouteFiles(API_DIR)
  .map(apiFilePathToRoute)
  .sort()

describe('mock-rest route coverage', () => {
  it('finds the App Router API handlers', () => {
    expect(implementedRoutes.length).toBeGreaterThan(0)
  })

  it('has a fixture for every handler except the documented exclusions', () => {
    const expected = implementedRoutes.filter(
      (route) => !EXCLUDED_ROUTES.includes(route)
    )
    const missing = expected.filter(
      (route) => !MOCK_REST_ROUTES.includes(route)
    )

    expect(missing).toEqual([])
  })

  it('documents why each exclusion has no fixture', () => {
    for (const route of EXCLUDED_ROUTES) {
      expect(implementedRoutes).toContain(route)
      expect(MOCK_REST_ROUTES).not.toContain(route)
    }
  })

  it('has no fixture for a route that no longer exists', () => {
    const orphaned = MOCK_REST_ROUTES.filter(
      (route) => !implementedRoutes.includes(route)
    )

    expect(orphaned).toEqual([])
  })
})

describe('apiFilePathToRoute', () => {
  it('converts dynamic segments to MSW parameters', () => {
    expect(apiFilePathToRoute('src/app/api/blog/[id]/route.ts')).toBe(
      '/api/blog/:id'
    )
    expect(
      apiFilePathToRoute(
        'src/app/api/blog/[id]/comments/[commentId]/like/route.ts'
      )
    ).toBe('/api/blog/:id/comments/:commentId/like')
  })

  it('handles Windows separators', () => {
    expect(apiFilePathToRoute('src\\app\\api\\photos\\[id]\\route.ts')).toBe(
      '/api/photos/:id'
    )
  })
})
