
import React, { createContext, useContext, ReactNode } from 'react';
import { useCachedProducts } from '@/hooks/useCachedProducts';
import { Product } from '@/hooks/useSupabaseProducts';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  getProductById: (id: number) => Product | undefined;
  refetch: () => Promise<Product[]>;
  refreshProducts: () => Promise<Product[]>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children }) => {
  const cachedProducts = useCachedProducts();

  // Add some debugging
  console.log('ProductsProvider rendering with:', {
    productsCount: cachedProducts.products.length,
    loading: cachedProducts.loading
  });

  return (
    <ProductsContext.Provider value={cachedProducts}>
      {children}
    </ProductsContext.Provider>
  );
};
