export const TEST_ORIGIN = `http://localhost:${process.env.PORT ?? 4000}`

export const buildAppRouteRequest = (
  pathnameWithQuery: string,
  init: RequestInit = {}
): Request => {
  const path = pathnameWithQuery.startsWith('/')
    ? pathnameWithQuery
    : `/${pathnameWithQuery}`
  const url = pathnameWithQuery.startsWith('http')
    ? pathnameWithQuery
    : `${TEST_ORIGIN}${path}`
  return new Request(url, init)
}

export const buildJsonRequest = (
  pathnameWithQuery: string,
  body: unknown,
  init: RequestInit = {}
): Request =>
  buildAppRouteRequest(pathnameWithQuery, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
    body: JSON.stringify(body),
    ...init
  })

/** App Router passes dynamic params as a promise in Next 15+. */
export const routeContext = <T extends Record<string, string>>(params: T) => ({
  params: Promise.resolve(params)
})
