import { z } from 'zod'

/** GET /api/eth-usd — success. */
export const ethUsdResponseSchema = z.object({
  usd: z.number()
})

/** GET /api/eth-usd — upstream or local failure. */
export const ethUsdErrorResponseSchema = z.object({
  msg: z.string(),
  status: z.number().optional(),
  data: z.unknown().optional(),
  error: z.string().optional()
})

export type EthUsdResponse = z.infer<typeof ethUsdResponseSchema>
