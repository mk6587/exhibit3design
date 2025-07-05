
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { products as initialProducts } from '@/data/products';
import { Product } from '@/types/product';

interface ProductsContextType {
  products: Product[];
  updateProduct: (updatedProduct: Product) => void;
  getProductById: (id: number) => Product | undefined;
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
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const getProductById = (id: number) => {
    return products.find(product => product.id === id);
  };

  return (
    <ProductsContext.Provider value={{ products, updateProduct, getProductById }}>
      {children}
    </ProductsContext.Provider>
  );
};
