import Portfolio from '@/app/portfolio/_components/Portfolio'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', async () =>
  (await import('@/test/mocks/next')).nextImageMock()
)

describe('Portfolio', () => {
  it('opens on Skills instead of the empty showcase', () => {
    render(<Portfolio />)

    expect(
      screen.getByRole('heading', { name: 'Skills', level: 2 })
    ).toBeVisible()
    expect(screen.getByRole('heading', { name: 'React' })).toBeVisible()
    expect(screen.queryByText('Nothing to see here.')).not.toBeInTheDocument()
  })

  it('starts the showcase at the top after switching sections', async () => {
    const user = userEvent.setup()
    render(<Portfolio />)

    const skillsPanel = screen.getByTestId('portfolio-showcase')
    skillsPanel.scrollTop = 240

    await user.click(screen.getByRole('button', { name: 'Projects' }))

    expect(
      screen.getByRole('heading', { name: 'Projects', level: 2 })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Messenger Application' })
    ).toBeVisible()
    expect(screen.getByTestId('portfolio-showcase').scrollTop).toBe(0)
  })
})
