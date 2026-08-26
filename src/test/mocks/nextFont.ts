/**
 * `next/font/google` is a build-time transform that only exists inside the Next
 * compiler, so importing a component that calls `Inter()` throws under Vitest.
 * `vitest.config.mts` aliases the module here.
 *
 * Add an export when a component starts using another family; the failure looks
 * like `TypeError: <Family> is not a function`.
 */
const googleFont = () => ({
  className: 'mock-font',
  variable: '--mock-font',
  style: { fontFamily: 'mock-font' }
})

export const Inter = googleFont
export const Montserrat = googleFont
