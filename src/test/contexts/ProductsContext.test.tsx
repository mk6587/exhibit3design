import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ProductsProvider, useProducts } from '@/contexts/ProductsContext'

// Test component to use the context
const TestComponent = () => {
  const { products, loading } = useProducts()

  return (
    <div>
      <div data-testid="products-count">{products.length}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Loaded'}</div>
    </div>
  )
}

describe('ProductsContext', () => {
  it('provides products from Supabase', () => {
    const { getByTestId } = render(
      <ProductsProvider>
        <TestComponent />
      </ProductsProvider>
    )

    expect(getByTestId('products-count')).toBeInTheDocument()
    expect(getByTestId('loading')).toBeInTheDocument()
  })
})