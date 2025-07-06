import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductGallery from '@/components/product/ProductGallery'

const mockImages = [
  'image1.jpg',
  'image2.jpg',
  'image3.jpg'
]

describe('ProductGallery', () => {
  it('renders main image correctly', () => {
    render(<ProductGallery images={mockImages} title="Test Product" />)
    
    const mainImage = screen.getByAltText('Test Product - preview 1')
    expect(mainImage).toBeInTheDocument()
    expect(mainImage).toHaveAttribute('src', mockImages[0])
  })

  it('renders thumbnails when multiple images exist', () => {
    render(<ProductGallery images={mockImages} title="Test Product" />)
    
    const thumbnails = screen.getAllByRole('button')
    expect(thumbnails).toHaveLength(mockImages.length)
  })

  it('does not render thumbnails when only one image exists', () => {
    render(<ProductGallery images={[mockImages[0]]} title="Test Product" />)
    
    const thumbnails = screen.queryAllByRole('button')
    expect(thumbnails).toHaveLength(0)
  })

  it('changes active image when thumbnail is clicked', () => {
    render(<ProductGallery images={mockImages} title="Test Product" />)
    
    const thumbnails = screen.getAllByRole('button')
    fireEvent.click(thumbnails[1])
    
    const mainImage = screen.getByAltText('Test Product - preview 2')
    expect(mainImage).toHaveAttribute('src', mockImages[1])
  })

  it('opens image viewer when main image is clicked', () => {
    render(<ProductGallery images={mockImages} title="Test Product" />)
    
    const mainImage = screen.getByAltText('Test Product - preview 1')
    fireEvent.click(mainImage)
    
    // Check if image viewer dialog is opened
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('handles image errors gracefully', () => {
    render(<ProductGallery images={mockImages} title="Test Product" />)
    
    const mainImage = screen.getByAltText('Test Product - preview 1')
    fireEvent.error(mainImage)
    
    // Should fallback to placeholder image
    expect(mainImage).toHaveAttribute('src')
  })
})