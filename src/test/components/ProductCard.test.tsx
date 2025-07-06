import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductCard from '@/components/product/ProductCard'
import { ProductsProvider } from '@/contexts/ProductsContext'

const mockProduct = {
  id: 1,
  title: "Test Product",
  description: "Test description",
  price: 99.99,
  images: ["test-image.jpg"],
  tags: ["tag1", "tag2"],
  featured: true,
  long_description: "Long description",
  specifications: "Test specs",
  file_size: "1MB"
}

const ProductCardWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ProductsProvider>
      {children}
    </ProductsProvider>
  </BrowserRouter>
)

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    )

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })

  it('displays featured badge when product is featured', () => {
    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    )

    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('does not display featured badge when product is not featured', () => {
    const nonFeaturedProduct = { ...mockProduct, featured: false }
    render(
      <ProductCardWrapper>
        <ProductCard product={nonFeaturedProduct} />
      </ProductCardWrapper>
    )

    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })

  it('handles image error gracefully', () => {
    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    )

    const image = screen.getByRole('img')
    fireEvent.error(image)
    
    // Should not crash and fallback image should be used
    expect(image).toHaveAttribute('src')
  })
})