import { MOCK_REST_CATALOG, type MockRestEntry } from '@/test/mock-rest/catalog'
import { HttpResponse, delay, http } from 'msw'

const matchesQuery = (requestUrl: string, query: string) => {
  if (!query) return true

  const actual = new URL(requestUrl).searchParams
  const expected = new URLSearchParams(query)

  for (const [key, value] of expected) {
    if (actual.get(key) !== value) return false
  }

  return true
}

/**
 * Builds MSW handlers for the catalog.
 *
 * Entries that declare a `query` are registered first so they win over the
 * catch-all entry for the same route.
 */
export const toMockRestHttpHandlers = (
  origin: string,
  entries: MockRestEntry[] = MOCK_REST_CATALOG
) =>
  [...entries]
    .sort((a, b) => Number(Boolean(b.query)) - Number(Boolean(a.query)))
    .map((entry) => {
      const method = entry.method.toLowerCase() as Lowercase<
        MockRestEntry['method']
      >

      return http[method](`${origin}${entry.route}`, async ({ request }) => {
        // Returning undefined hands the request to the next matching handler.
        if (!matchesQuery(request.url, entry.query)) return undefined

        if (entry.delay > 0) await delay(entry.delay)

        if (entry.contentType && entry.contentType !== 'application/json') {
          return new HttpResponse(String(entry.responseBody), {
            status: entry.status,
            headers: { 'Content-Type': entry.contentType }
          })
        }

        return HttpResponse.json(
          entry.responseBody as Parameters<typeof HttpResponse.json>[0],
          { status: entry.status }
        )
      })
    })
