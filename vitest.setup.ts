import '@testing-library/jest-dom/vitest'
import { mswServer } from '@/test/msw/nodeServer'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'bypass' }))

afterEach(() => {
  cleanup()
  mswServer.resetHandlers()
})

afterAll(() => mswServer.close())
