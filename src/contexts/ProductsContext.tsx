
import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseProducts, Product } from '@/hooks/useSupabaseProducts';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  getProductById: (id: number) => Product | undefined;
  refetch: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType>({
  products: [],
  loading: true,
  updateProduct: async () => {},
  getProductById: () => undefined,
  refetch: async () => {}
});

export const useProducts = () => {
  const context = useContext(ProductsContext);
  return context;
};

interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children }) => {
  const supabaseProducts = useSupabaseProducts();

  const contextValue = {
    products: supabaseProducts.products || [],
    loading: supabaseProducts.loading,
    updateProduct: supabaseProducts.updateProduct,
    getProductById: supabaseProducts.getProductById,
    refetch: supabaseProducts.refetch
  };

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
};
