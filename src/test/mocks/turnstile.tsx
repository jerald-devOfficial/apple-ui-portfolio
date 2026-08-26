/**
 * Stub for `@marsidev/react-turnstile`.
 *
 * Renders a button that hands a fixed token to `onSuccess`, so tests can drive
 * the widget without loading Cloudflare's script.
 *
 * ```ts
 * vi.mock('@marsidev/react-turnstile', async () =>
 *   (await import('@/test/mocks/turnstile')).turnstileMock()
 * )
 * ```
 */
export const TURNSTILE_TEST_TOKEN = 'test-turnstile-token'

type StubProps = {
  onSuccess?: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

export const turnstileMock = () => ({
  Turnstile: ({ onSuccess, onExpire, onError }: StubProps) => (
    <div data-testid="turnstile-stub">
      <button type="button" onClick={() => onSuccess?.(TURNSTILE_TEST_TOKEN)}>
        Pass security check
      </button>
      <button type="button" onClick={() => onExpire?.()}>
        Expire security check
      </button>
      <button type="button" onClick={() => onError?.()}>
        Fail security check
      </button>
    </div>
  )
})
