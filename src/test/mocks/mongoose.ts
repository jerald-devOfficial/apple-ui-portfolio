/**
 * Chainable stand-ins for Mongoose query builders.
 *
 * `Model.find(q).sort().skip().limit().lean()` and a bare `await Model.find(q)`
 * both resolve to the same value, because the chain is itself thenable.
 */
import { vi } from 'vitest'

const CHAIN_METHODS = [
  'sort',
  'skip',
  'limit',
  'select',
  'populate',
  'lean',
  'exec'
] as const

export type QueryChain<T> = {
  [K in (typeof CHAIN_METHODS)[number]]: ReturnType<typeof vi.fn>
} & PromiseLike<T>

export const queryChain = <T>(result: T): QueryChain<T> => {
  const chain = {} as Record<string, unknown>

  for (const method of CHAIN_METHODS) {
    chain[method] = vi.fn(() => chain)
  }

  chain.then = (
    onFulfilled?: (value: T) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(result).then(onFulfilled, onRejected)

  return chain as unknown as QueryChain<T>
}

/**
 * A constructor stub for models the handlers instantiate with `new Model(doc)`.
 * `defaults` stands in for the schema defaults Mongoose would apply.
 */
export const modelConstructor = (defaults: Record<string, unknown> = {}) => {
  const save = vi.fn().mockResolvedValue(undefined)

  const ctor = vi.fn(function (
    this: Record<string, unknown>,
    doc: Record<string, unknown>
  ) {
    Object.assign(this, defaults, doc, { save })
  }) as unknown as (new (
    doc: Record<string, unknown>
  ) => Record<string, unknown>) & { save: typeof save }

  ctor.save = save

  return ctor
}
