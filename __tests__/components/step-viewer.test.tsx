import { render, screen } from '@testing-library/react'
import StepViewer from '@/components/StepViewer'
import type { LabStep } from '@/types'

function createStep(overrides: Partial<LabStep>): LabStep {
  return {
    id: 'step-1',
    lab_id: 'lab-1',
    step_order: 1,
    block_type: 'text',
    caption: null,
    content: 'Safe content',
    ...overrides,
  }
}

describe('StepViewer', () => {
  it('does not render unsafe javascript links', () => {
    render(
      <StepViewer
        steps={[
          createStep({
            block_type: 'link',
            caption: 'Unsafe link',
            content: 'javascript:alert(1)',
          }),
        ]}
      />
    )

    expect(screen.queryByRole('link', { name: /unsafe link/i })).not.toBeInTheDocument()
  })

  it('does not render data URLs as images', () => {
    render(
      <StepViewer
        steps={[
          createStep({
            block_type: 'image',
            caption: 'Unsafe image',
            content: 'data:image/svg+xml,<svg></svg>',
          }),
        ]}
      />
    )

    expect(screen.queryByRole('img', { name: /unsafe image/i })).not.toBeInTheDocument()
  })
})
