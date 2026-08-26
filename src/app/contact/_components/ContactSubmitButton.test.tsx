import ContactSubmitButton from '@/app/contact/_components/ContactSubmitButton'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const useFormStatus = vi.hoisted(() => vi.fn())

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom')
  return { ...actual, useFormStatus }
})

beforeEach(() => {
  useFormStatus.mockReturnValue({ pending: false })
})

describe('ContactSubmitButton', () => {
  it('is enabled while the form is idle', () => {
    render(<ContactSubmitButton />)

    const button = screen.getByRole('button')

    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('aria-busy', 'false')
  })

  it('disables itself and announces busy state while submitting', () => {
    useFormStatus.mockReturnValue({ pending: true })

    render(<ContactSubmitButton />)

    const button = screen.getByRole('button')

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})
