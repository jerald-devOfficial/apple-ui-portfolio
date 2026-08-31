import ContactForm from '@/app/contact/_components/ContactForm'
import type { ContactActionState } from '@/app/contact/state'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const submitContactAction = vi.hoisted(() =>
  vi.fn<
    (
      prev: ContactActionState,
      formData: FormData
    ) => Promise<ContactActionState>
  >()
)
const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
}))

vi.mock('@/app/contact/actions', () => ({ submitContactAction }))
vi.mock('react-toastify', () => ({ toast }))
vi.mock('@marsidev/react-turnstile', async () =>
  (await import('@/test/mocks/turnstile')).turnstileMock()
)

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(
    screen.getByPlaceholderText('Your email address'),
    'visitor@example.com'
  )
  await user.type(screen.getByPlaceholderText('Your full name'), 'Test Visitor')
  await user.type(screen.getByPlaceholderText('Email Subject'), 'Saying hello')
  await user.type(
    screen.getByPlaceholderText(/Please type your message/),
    'This message is comfortably longer than ten characters.'
  )
}

const submit = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: '' }))
}

beforeEach(() => {
  vi.clearAllMocks()
  submitContactAction.mockResolvedValue({
    msg: ['Message sent successfully'],
    success: true,
    emailSent: true,
    resetKey: 1
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('ContactForm without Turnstile configured', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '')
  })

  it('renders every message field', () => {
    render(<ContactForm />)

    expect(
      screen.getByRole('heading', { name: 'Write me a message' })
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your email address')).toBeRequired()
    expect(screen.getByPlaceholderText('Your full name')).toBeRequired()
    expect(screen.getByPlaceholderText('Email Subject')).toBeRequired()
    expect(
      screen.getByPlaceholderText(/Please type your message/)
    ).toBeRequired()
  })

  it('omits the security check widget', () => {
    render(<ContactForm />)

    expect(screen.queryByTestId('turnstile-stub')).not.toBeInTheDocument()
  })

  it('reports a successful submission', async () => {
    const user = userEvent.setup()

    render(<ContactForm />)
    await fillRequiredFields(user)
    await submit(user)

    await waitFor(() => expect(submitContactAction).toHaveBeenCalled())
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Message sent successfully')
    )
  })

  it('surfaces every validation message as an error toast', async () => {
    submitContactAction.mockResolvedValue({
      msg: ['Message cannot contain links.', 'Please enter your full name.'],
      success: false,
      resetKey: 0
    })

    const user = userEvent.setup()

    render(<ContactForm />)
    await fillRequiredFields(user)
    await submit(user)

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(2))
    expect(toast.error).toHaveBeenCalledWith('Message cannot contain links.')
    expect(toast.error).toHaveBeenCalledWith('Please enter your full name.')
  })

  it('warns when the message is stored but the email did not go out', async () => {
    submitContactAction.mockResolvedValue({
      msg: [
        'Your message was received, but the email notification could not be delivered yet.'
      ],
      success: true,
      emailSent: false,
      resetKey: 1
    })

    const user = userEvent.setup()

    render(<ContactForm />)
    await fillRequiredFields(user)
    await submit(user)

    await waitFor(() => expect(toast.warn).toHaveBeenCalledTimes(1))
    expect(toast.success).not.toHaveBeenCalled()
  })
})

describe('ContactForm with Turnstile configured', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '1x00000000000000000000AA')
  })

  it('renders the widget', () => {
    render(<ContactForm />)

    expect(screen.getByTestId('turnstile-stub')).toBeInTheDocument()
  })

  it('blocks submission until the security check passes', async () => {
    const user = userEvent.setup()

    render(<ContactForm />)
    await fillRequiredFields(user)
    await submit(user)

    expect(toast.error).toHaveBeenCalledWith(
      'Please complete the security check before sending.'
    )
    expect(submitContactAction).not.toHaveBeenCalled()
  })

  it('submits the token once the widget resolves', async () => {
    const user = userEvent.setup()

    render(<ContactForm />)
    await fillRequiredFields(user)
    await user.click(
      screen.getByRole('button', { name: 'Pass security check' })
    )
    await submit(user)

    await waitFor(() => expect(submitContactAction).toHaveBeenCalled())

    const formData = submitContactAction.mock.calls[0]?.[1]
    expect(formData?.get('turnstileToken')).toBe('test-turnstile-token')
  })

  it('blocks submission again after the token expires', async () => {
    const user = userEvent.setup()

    render(<ContactForm />)
    await fillRequiredFields(user)
    await user.click(
      screen.getByRole('button', { name: 'Pass security check' })
    )
    await user.click(
      screen.getByRole('button', { name: 'Expire security check' })
    )
    await submit(user)

    expect(toast.error).toHaveBeenCalledWith(
      'Please complete the security check before sending.'
    )
    expect(submitContactAction).not.toHaveBeenCalled()
  })
})
