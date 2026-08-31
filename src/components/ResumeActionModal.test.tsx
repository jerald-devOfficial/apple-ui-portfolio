import ResumeActionModal from '@/components/ResumeActionModal'
import ResumeDockItem from '@/components/ResumeDockItem'
import { RESUME_HTML_HREF, RESUME_PDF_HREF } from '@/lib/resume'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', async () =>
  (await import('@/test/mocks/next')).nextImageMock()
)

describe('ResumeActionModal', () => {
  it('offers a PDF download and an HTML preview without starting either', () => {
    render(<ResumeActionModal isOpen onClose={() => {}} />)

    expect(screen.getByRole('dialog', { name: 'Resume' })).toBeVisible()

    const pdf = screen.getByRole('link', { name: 'Download PDF' })
    expect(pdf).toHaveAttribute('href', RESUME_PDF_HREF)
    expect(pdf).toHaveAttribute('download')

    const html = screen.getByRole('link', { name: 'View in browser' })
    expect(html).toHaveAttribute('href', RESUME_HTML_HREF)
    expect(html).toHaveAttribute('target', '_blank')
  })

  it('does not render while closed', () => {
    render(<ResumeActionModal isOpen={false} onClose={() => {}} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('ResumeDockItem', () => {
  it('asks before downloading instead of navigating straight to the PDF', async () => {
    const user = userEvent.setup()
    render(<ResumeDockItem img="/images/icons/macOS-resume.png" />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Download PDF' })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Resume' }))

    expect(screen.getByRole('dialog', { name: 'Resume' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Download PDF' })).toHaveAttribute(
      'href',
      RESUME_PDF_HREF
    )
  })
})
