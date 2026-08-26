import { z } from 'zod'

export const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const

export const mockRestEntrySchema = z.object({
  /** MSW-style path, e.g. `/api/blog/:id`. */
  route: z.string().regex(/^\/api\//, 'route must start with /api/'),
  method: z.enum(HTTP_METHODS),
  status: z.number().int().min(100).max(599),
  /** Query string this entry answers, e.g. `featured=true`. Empty matches any. */
  query: z.string().default(''),
  delay: z.number().min(0).default(0),
  description: z.string().min(1),
  responseBody: z.unknown(),
  contentType: z.string().optional()
})

export type MockRestEntry = z.infer<typeof mockRestEntrySchema>

const fixtureModules = import.meta.glob('./api/**/route.json', {
  eager: true
}) as Record<string, { default: unknown }>

/** `src/app/api/blog/[id]/route.ts` → `/api/blog/:id` */
export const apiFilePathToRoute = (filePath: string) => {
  const withoutPrefix = filePath
    .replace(/\\/g, '/')
    .replace(/^.*?src\/app\/api\//, '')
    .replace(/\/route\.(ts|tsx|json)$/, '')

  const segments = withoutPrefix
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      /^\[.+\]$/.test(segment) ? `:${segment.slice(1, -1)}` : segment
    )

  return `/api/${segments.join('/')}`
}

const parseFixture = (fixturePath: string, raw: unknown): MockRestEntry[] => {
  const rawEntries = Array.isArray(raw) ? raw : [raw]

  return rawEntries.map((entry, index) => {
    const parsed = mockRestEntrySchema.safeParse(entry)

    if (!parsed.success) {
      throw new Error(
        `Invalid mock-rest fixture at ${fixturePath}[${index}]: ${parsed.error.issues
          .map((issue) => `${issue.path.join('.')} ${issue.message}`)
          .join(', ')}`
      )
    }

    return parsed.data
  })
}

/** Fixture file path → parsed entries. */
export const MOCK_REST_FIXTURES: Record<string, MockRestEntry[]> =
  Object.fromEntries(
    Object.entries(fixtureModules).map(([fixturePath, module]) => [
      fixturePath,
      parseFixture(fixturePath, module.default)
    ])
  )

export const MOCK_REST_CATALOG: MockRestEntry[] =
  Object.values(MOCK_REST_FIXTURES).flat()

/** Routes covered by the catalog, e.g. `/api/blog/:id`. */
export const MOCK_REST_ROUTES = [
  ...new Set(MOCK_REST_CATALOG.map((entry) => entry.route))
].sort()

export const findMockRestEntry = (
  route: string,
  method: MockRestEntry['method'],
  query = ''
) =>
  MOCK_REST_CATALOG.find(
    (entry) =>
      entry.route === route && entry.method === method && entry.query === query
  )
