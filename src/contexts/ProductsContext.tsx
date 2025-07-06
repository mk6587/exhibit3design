
import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseProducts, Product } from '@/hooks/useSupabaseProducts';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  getProductById: (id: number) => Product | undefined;
  refetch: () => Promise<Product[]>;
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
  const supabaseProducts = useSupabaseProducts();

  return (
    <ProductsContext.Provider value={supabaseProducts}>
      {children}
    </ProductsContext.Provider>
  );
};
