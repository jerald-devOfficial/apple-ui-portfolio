import { z } from 'zod'

export const ethAddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, 'address must be a 20-byte hex string')

export const ethTxHashSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, 'hash must be a 32-byte hex string')

/**
 * GET /api/eth-balance — success.
 *
 * `wei` stays a string because a balance can exceed `Number.MAX_SAFE_INTEGER`;
 * `eth` is the display-safe conversion.
 */
export const ethBalanceResponseSchema = z.object({
  address: ethAddressSchema,
  wei: z.string().regex(/^\d+$/),
  eth: z.number()
})

/** The JSON-RPC transaction shape, with hex-encoded quantities. */
export const ethTransactionSchema = z.object({
  hash: z.string(),
  from: z.string(),
  to: z.string().nullable(),
  value: z.string(),
  gas: z.string(),
  gasPrice: z.string(),
  nonce: z.string(),
  input: z.string(),
  blockHash: z.string().nullable(),
  blockNumber: z.string().nullable(),
  transactionIndex: z.string().nullable()
})

/** GET /api/eth-transaction — success. */
export const ethTransactionResponseSchema = z.object({
  transaction: ethTransactionSchema
})

export type EthBalanceResponse = z.infer<typeof ethBalanceResponseSchema>
export type EthTransaction = z.infer<typeof ethTransactionSchema>
