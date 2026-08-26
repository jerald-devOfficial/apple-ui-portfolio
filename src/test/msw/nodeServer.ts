import { setupServer } from 'msw/node'

/**
 * Starts with no default handlers — tests opt in via `mswServer.use(...)`.
 */
export const mswServer = setupServer()
