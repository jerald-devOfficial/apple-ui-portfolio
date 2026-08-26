import BlogFilters from '@/app/blog/_components/BlogFilters'
import { resetNextMocks, routerMock, setSearchParams } from '@/test/mocks/next'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', async () =>
  (await import('@/test/mocks/next')).nextNavigationMock()
)

const categories = ['technology', 'design']

beforeEach(() => {
  resetNextMocks()
})

describe('BlogFilters', () => {
  it('seeds its controls from the current query string', () => {
    setSearchParams({ search: 'next', category: 'design', featured: 'true' })

    render(<BlogFilters categories={categories} />)

    expect(screen.getByPlaceholderText('Search blogs...')).toHaveValue('next')
    expect(screen.getByRole('combobox')).toHaveValue('design')
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('debounces a search into a query string', async () => {
    const user = userEvent.setup()

    render(<BlogFilters categories={categories} />)

    await user.type(screen.getByPlaceholderText('Search blogs...'), 'vitest')

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/blog?search=vitest'),
      { timeout: 3000 }
    )
  })

  it('pushes the selected category', async () => {
    const user = userEvent.setup()

    render(<BlogFilters categories={categories} />)

    await user.selectOptions(screen.getByRole('combobox'), 'design')

    await waitFor(
      () =>
        expect(routerMock.push).toHaveBeenCalledWith('/blog?category=design'),
      { timeout: 3000 }
    )
  })

  it('pushes the featured flag', async () => {
    const user = userEvent.setup()

    render(<BlogFilters categories={categories} />)

    await user.click(screen.getByRole('checkbox'))

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/blog?featured=true'),
      { timeout: 3000 }
    )
  })

  it('offers a clear action only while a filter is active', async () => {
    const user = userEvent.setup()

    render(<BlogFilters categories={categories} />)

    expect(
      screen.queryByRole('button', { name: 'Clear filters' })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox'))

    const clear = await screen.findByRole('button', { name: 'Clear filters' })
    await user.click(clear)

    expect(routerMock.push).toHaveBeenCalledWith('/blog')
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders a capitalised label for every category', () => {
    render(<BlogFilters categories={categories} />)

    expect(
      screen.getByRole('option', { name: 'All Categories' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Technology' })
    ).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Design' })).toBeInTheDocument()
  })
})
