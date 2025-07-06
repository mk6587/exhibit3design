import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductDetailPage from '@/pages/ProductDetailPage'
import { ProductsProvider } from '@/contexts/ProductsContext'

// Mock the product data
vi.mock('@/hooks/useSupabaseProducts', () => ({
  useSupabaseProducts: () => ({
    products: [
      {
        id: 1,
        title: "Test Product",
        description: "Test description",
        longDescription: "Long test description",
        price: 99.99,
        images: ["test-image.jpg"],
        tags: ["tag1", "tag2"],
        featured: true,
        specifications: "Test specs",
        fileSize: "1MB"
      }
    ],
    loading: false,
    error: null
  })
}))

const ProductDetailWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ProductsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/product/:id" element={children} />
          </Routes>
        </BrowserRouter>
      </ProductsProvider>
    </QueryClientProvider>
  )
}

describe('ProductDetailPage', () => {
  it('renders product details correctly', async () => {
    window.history.pushState({}, '', '/product/1')
    
    render(
      <ProductDetailWrapper>
        <ProductDetailPage />
      </ProductDetailWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByText('$99.99')).toBeInTheDocument()
    })
  })

  it('displays long description when available', async () => {
    window.history.pushState({}, '', '/product/1')
    
    render(
      <ProductDetailWrapper>
        <ProductDetailPage />
      </ProductDetailWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Long test description')).toBeInTheDocument()
    })
  })

  it('shows add to cart button', async () => {
    window.history.pushState({}, '', '/product/1')
    
    render(
      <ProductDetailWrapper>
        <ProductDetailPage />
      </ProductDetailWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
    })
  })

  it('displays product tags', async () => {
    window.history.pushState({}, '', '/product/1')
    
    render(
      <ProductDetailWrapper>
        <ProductDetailPage />
      </ProductDetailWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument()
      expect(screen.getByText('tag2')).toBeInTheDocument()
    })
  })

  it('shows specifications when available', async () => {
    window.history.pushState({}, '', '/product/1')
    
    render(
      <ProductDetailWrapper>
        <ProductDetailPage />
      </ProductDetailWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Test specs')).toBeInTheDocument()
    })
  })
})