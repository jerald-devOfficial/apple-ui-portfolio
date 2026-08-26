import {
  blogDeleteResponseSchema,
  blogListResponseSchema,
  blogResponseSchema,
  commentLikeResponseSchema,
  commentListResponseSchema
} from '@/contracts/blog'
import { repertoireResponseSchema } from '@/contracts/chess'
import {
  contactListResponseSchema,
  contactMutationResponseSchema,
  contactSubmitResponseSchema
} from '@/contracts/contact'
import {
  diaryLikeResponseSchema,
  diaryListResponseSchema,
  diaryResourcesResponseSchema,
  diarySnippetsResponseSchema,
  diaryStatsResponseSchema
} from '@/contracts/diary'
import {
  ethBalanceResponseSchema,
  ethTransactionResponseSchema
} from '@/contracts/etherscan'
import { ethUsdResponseSchema } from '@/contracts/ethUsd'
import {
  photoDeleteResponseSchema,
  photoListResponseSchema,
  photoResponseSchema
} from '@/contracts/photos'
import {
  errorResponseSchema,
  messageEnvelopeSchema,
  msgResponseSchema
} from '@/contracts/shared'
import { MOCK_REST_CATALOG } from '@/test/mock-rest/catalog'
import { describe, expect, it } from 'vitest'
import type { ZodType } from 'zod'

/** `METHOD /route status` → schema the fixture body must satisfy. */
const CONTRACTS: Record<string, ZodType> = {
  'GET /api/blog 200': blogListResponseSchema,
  'POST /api/blog 401': errorResponseSchema,
  'GET /api/blog/:id 200': blogResponseSchema,
  'PATCH /api/blog/:id 403': errorResponseSchema,
  'DELETE /api/blog/:id 200': blogDeleteResponseSchema,
  'GET /api/blog/:id/comments 200': commentListResponseSchema,
  'POST /api/blog/:id/comments 401': errorResponseSchema,
  'POST /api/blog/:id/comments/:commentId/like 200': commentLikeResponseSchema,

  'GET /api/diary 200': diaryListResponseSchema,
  'GET /api/diary 500': msgResponseSchema,
  'POST /api/diary/:id/like 200': diaryLikeResponseSchema,
  'POST /api/diary/:id/like 401': errorResponseSchema,
  'GET /api/diary/stats 200': diaryStatsResponseSchema,
  'GET /api/diary/snippets 200': diarySnippetsResponseSchema,
  'GET /api/diary/resources 200': diaryResourcesResponseSchema,

  'POST /api/contact 200': contactSubmitResponseSchema,
  'POST /api/contact 400': contactSubmitResponseSchema,
  'GET /api/contact 200': contactListResponseSchema,
  'PATCH /api/contact/:id 200': contactMutationResponseSchema,
  'DELETE /api/contact/:id 200': contactMutationResponseSchema,

  'GET /api/photos 200': photoListResponseSchema,
  'POST /api/photos 401': errorResponseSchema,
  'PUT /api/photos/:id 200': photoResponseSchema,
  'DELETE /api/photos/:id 200': photoDeleteResponseSchema,

  'GET /api/chess/repertoire 200': repertoireResponseSchema,
  'GET /api/chess/repertoire 401': msgResponseSchema,
  'PATCH /api/chess/repertoire 400': msgResponseSchema,
  'POST /api/chess/repertoire/import 400': msgResponseSchema,
  'GET /api/chess/repertoire/export/:lineId 400': msgResponseSchema,

  'GET /api/eth-usd 200': ethUsdResponseSchema,
  'GET /api/eth-usd 502': msgResponseSchema,
  'GET /api/eth-balance 200': ethBalanceResponseSchema,
  'GET /api/eth-balance 400': msgResponseSchema,
  'GET /api/eth-balance 502': msgResponseSchema,
  'GET /api/eth-transaction 200': ethTransactionResponseSchema,
  'GET /api/eth-transaction 404': msgResponseSchema
}

/**
 * Fixtures that intentionally answer with something other than JSON, so there
 * is no Zod contract to check.
 */
const NON_JSON_KEYS = new Set(['GET /api/chess/repertoire/export/:lineId 200'])

const keyFor = (entry: (typeof MOCK_REST_CATALOG)[number]) =>
  `${entry.method} ${entry.route} ${entry.status}`

describe('mock-rest catalog contracts', () => {
  it('has a contract registered for every JSON fixture', () => {
    const unregistered = MOCK_REST_CATALOG.filter((entry) => {
      const key = keyFor(entry)
      return !NON_JSON_KEYS.has(key) && !CONTRACTS[key]
    }).map(keyFor)

    expect(unregistered).toEqual([])
  })

  it('has no contract registered for a fixture that no longer exists', () => {
    const catalogKeys = new Set(MOCK_REST_CATALOG.map(keyFor))
    const orphaned = Object.keys(CONTRACTS).filter(
      (key) => !catalogKeys.has(key)
    )

    expect(orphaned).toEqual([])
  })

  for (const entry of MOCK_REST_CATALOG) {
    const key = keyFor(entry)

    if (NON_JSON_KEYS.has(key)) {
      it(`${key} (${entry.description}) serves a string body`, () => {
        expect(typeof entry.responseBody).toBe('string')
        expect(entry.contentType).toBeDefined()
      })
      continue
    }

    it(`${key} (${entry.description}) matches its contract`, () => {
      const result = CONTRACTS[key].safeParse(entry.responseBody)

      expect(
        result.success ? [] : result.error.issues.map((issue) => issue.message)
      ).toEqual([])
      expect(result.success).toBe(true)
    })
  }

  it('reserves the message envelope for contact responses', () => {
    const contactPost = MOCK_REST_CATALOG.find(
      (entry) => entry.route === '/api/contact' && entry.method === 'POST'
    )

    expect(
      messageEnvelopeSchema.safeParse(contactPost?.responseBody).success
    ).toBe(true)
  })
})
