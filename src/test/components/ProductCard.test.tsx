import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductCard from '@/components/product/ProductCard'

const mockProduct = {
  id: 1,
  title: "Test Product",
  price: 99.99,
  image: "test-image.jpg",
  tags: ["tag1", "tag2"]
}

const ProductCardWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const { getByText } = render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    )

    expect(getByText('Test Product')).toBeInTheDocument()
    expect(getByText('€99.99')).toBeInTheDocument()
    expect(getByText('tag1')).toBeInTheDocument()
    expect(getByText('tag2')).toBeInTheDocument()
  })
})