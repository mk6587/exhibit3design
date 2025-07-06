import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ProductGallery from '@/components/product/ProductGallery'

const mockImages = [
  'image1.jpg',
  'image2.jpg',
  'image3.jpg'
]

describe('ProductGallery', () => {
  it('renders main image correctly', () => {
    const { getByAltText } = render(<ProductGallery images={mockImages} title="Test Product" />)
    
    const mainImage = getByAltText('Test Product - preview 1')
    expect(mainImage).toBeInTheDocument()
    expect(mainImage).toHaveAttribute('src', mockImages[0])
  })
})