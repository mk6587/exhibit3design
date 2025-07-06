import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ProductsProvider } from '@/contexts/ProductsContext'
import ProductDetailPage from '@/pages/ProductDetailPage'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ProductsProvider>
      {children}
    </ProductsProvider>
  </BrowserRouter>
)

describe('ProductDetailPage', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TestWrapper>
        <ProductDetailPage />
      </TestWrapper>
    )
    
    expect(container).toBeInTheDocument()
  })
})