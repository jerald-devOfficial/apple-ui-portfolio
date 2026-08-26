import DiaryCard from '@/components/DiaryCard'
import type { IDiary } from '@/models/Diary'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', async () =>
  (await import('@/test/mocks/next')).nextLinkMock()
)

const buildDiary = (overrides: Partial<IDiary> = {}): IDiary => ({
  _id: 'diary-1',
  userId: 'reader@example.com',
  title: 'Learning Vitest',
  content: '<p>Today I wired up the harness.</p>',
  publicity: true,
  status: 'published',
  isFavorite: false,
  tags: [],
  createdAt: '2024-05-01T10:30:00.000Z',
  ...overrides
})

describe('DiaryCard', () => {
  it('links to the diary and shows the title', () => {
    render(<DiaryCard diary={buildDiary()} />)

    const title = screen.getByRole('heading', { name: /Learning Vitest/ })

    expect(title).toBeInTheDocument()
    expect(screen.getAllByRole('link')[0]).toHaveAttribute(
      'href',
      '/diary/diary-1'
    )
  })

  it('labels a public diary as public', () => {
    render(<DiaryCard diary={buildDiary({ publicity: true })} />)

    expect(screen.getByText('Public')).toBeInTheDocument()
    expect(screen.queryByText('Private')).not.toBeInTheDocument()
  })

  it('labels a private diary as private', () => {
    render(<DiaryCard diary={buildDiary({ publicity: false })} />)

    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('strips markup and code blocks out of the preview', () => {
    render(
      <DiaryCard
        diary={buildDiary({
          content:
            '<p>Before</p><pre class="language-ts"><code>const a = 1</code></pre><p>After</p>'
        })}
      />
    )

    expect(screen.getByText(/Before \[code block\] After/)).toBeInTheDocument()
    expect(screen.queryByText(/const a = 1/)).not.toBeInTheDocument()
  })

  it('truncates a long preview', () => {
    render(
      <DiaryCard
        diary={buildDiary({ content: '<p>' + 'x'.repeat(300) + '</p>' })}
      />
    )

    expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument()
  })

  it('shows only the first three tags plus an overflow count', () => {
    render(
      <DiaryCard diary={buildDiary({ tags: ['a', 'b', 'c', 'd', 'e'] })} />
    )

    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('c')).toBeInTheDocument()
    expect(screen.queryByText('d')).not.toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('hides owner controls for a visitor', () => {
    render(<DiaryCard diary={buildDiary()} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /edit/i })
    ).not.toBeInTheDocument()
  })

  it('offers edit and delete to the owner', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()

    render(<DiaryCard diary={buildDiary()} isOwner onDelete={onDelete} />)

    const editLink = screen
      .getAllByRole('link')
      .find((link) => link.getAttribute('href') === '/diary/diary-1/edit')

    expect(editLink).toBeDefined()

    await user.click(screen.getByRole('button'))

    expect(onDelete).toHaveBeenCalledWith('diary-1')
  })

  it('falls back to "Recent" when there is no created date', () => {
    render(<DiaryCard diary={buildDiary({ createdAt: undefined })} />)

    expect(screen.getByText('Recent')).toBeInTheDocument()
  })
})
