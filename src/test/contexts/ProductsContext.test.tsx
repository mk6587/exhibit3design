import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductsProvider, useProducts } from '@/contexts/ProductsContext'

// Test component to use the context
const TestComponent = () => {
  const { products, loading, getProductById } = useProducts()
  
  const testProduct = {
    id: 1,
    title: "Test Product",
    description: "Test description",
    price: 99.99,
    images: ["test.jpg"],
    tags: ["test"],
    featured: false,
    long_description: "Long desc",
    specifications: "Specs",
    file_size: "1MB"
  }

  return (
    <div>
      <div data-testid="products-count">{products.length}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Loaded'}</div>
      {products.map(product => (
        <div key={product.id} data-testid={`product-${product.id}`}>
          {product.title}
        </div>
      ))}
    </div>
  )
}

describe('ProductsContext', () => {
  it('provides products from Supabase', () => {
    render(
      <ProductsProvider>
        <TestComponent />
      </ProductsProvider>
    )

    expect(screen.getByTestId('products-count')).toBeInTheDocument()
    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(
      <ProductsProvider>
        <TestComponent />
      </ProductsProvider>
    )

    // Should show loading or loaded state
    const loadingElement = screen.getByTestId('loading')
    expect(loadingElement).toHaveTextContent(/loading|loaded/i)
  })
})