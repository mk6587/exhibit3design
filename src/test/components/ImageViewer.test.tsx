import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageViewer from '@/components/ui/image-viewer'

const mockImages = [
  'image1.jpg',
  'image2.jpg',
  'image3.jpg'
]

describe('ImageViewer', () => {
  it('renders when open', () => {
    render(
      <ImageViewer
        isOpen={true}
        onClose={vi.fn()}
        images={mockImages}
        title="Test Gallery"
      />
    )
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Gallery')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <ImageViewer
        isOpen={false}
        onClose={vi.fn()}
        images={mockImages}
        title="Test Gallery"
      />
    )
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('displays current image', () => {
    render(
      <ImageViewer
        isOpen={true}
        onClose={vi.fn()}
        images={mockImages}
        initialIndex={1}
        title="Test Gallery"
      />
    )
    
    const image = screen.getByAltText('Test Gallery 2')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockImages[1])
  })

  it('shows image counter when multiple images', () => {
    render(
      <ImageViewer
        isOpen={true}
        onClose={vi.fn()}
        images={mockImages}
        title="Test Gallery"
      />
    )
    
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('shows navigation arrows when multiple images', () => {
    render(
      <ImageViewer
        isOpen={true}
        onClose={vi.fn()}
        images={mockImages}
        title="Test Gallery"
      />
    )
    
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument()
    expect(screen.getByLabelText('Next image')).toBeInTheDocument()
  })

  it('navigates to next image when next button clicked', () => {
    render(
      <ImageViewer
        isOpen={true}
        onClose={vi.fn()}
        images={mockImages}
        title="Test Gallery"
      />
    )
    
    const nextButton = screen.getByLabelText('Next image')
    fireEvent.click(nextButton)
    
    expect(screen.getByText('2 of 3')).toBeInTheDocument()
  })

  it('navigates to previous image when previous button clicked', () => {
    render(
      <ImageViewer
        isOpen={true}
        onClose={vi.fn()}
        images={mockImages}
        initialIndex={1}
        title="Test Gallery"
      />
    )
    
    const prevButton = screen.getByLabelText('Previous image')
    fireEvent.click(prevButton)
    
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('shows zoom controls', () => {
    render(
      <ImageViewer
        isOpen={true}
        onClose={vi.fn()}
        images={mockImages}
        title="Test Gallery"
      />
    )
    
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument()
    expect(screen.getByLabelText('Reset view')).toBeInTheDocument()
  })

  it('closes when close button clicked', () => {
    const onClose = vi.fn()
    render(
      <ImageViewer
        isOpen={true}
        onClose={onClose}
        images={mockImages}
        title="Test Gallery"
      />
    )
    
    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('shows thumbnails when multiple images', () => {
    render(
      <ImageViewer
        isOpen={true}
        onClose={vi.fn()}
        images={mockImages}
        title="Test Gallery"
      />
    )
    
    const thumbnails = screen.getAllByAltText(/Thumbnail \d+/)
    expect(thumbnails).toHaveLength(mockImages.length)
  })
})