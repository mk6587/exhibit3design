import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import ImageViewer from '@/components/ui/image-viewer'

const mockImages = [
  'image1.jpg',
  'image2.jpg',
  'image3.jpg'
]

describe('ImageViewer', () => {
  it('renders when open', () => {
    const { getByRole } = render(
      <ImageViewer
        isOpen={true}
        onClose={vi.fn()}
        images={mockImages}
        title="Test Gallery"
      />
    )
    
    expect(getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    const { queryByRole } = render(
      <ImageViewer
        isOpen={false}
        onClose={vi.fn()}
        images={mockImages}
        title="Test Gallery"
      />
    )
    
    expect(queryByRole('dialog')).not.toBeInTheDocument()
  })
})