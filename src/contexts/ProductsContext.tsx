
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useSupabaseProducts, Product } from '@/hooks/useSupabaseProducts';
import { toast } from 'sonner';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  getProductById: (id: number) => Product | undefined;
  refetch: () => Promise<void>;
  // Cart functionality
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Cart functionality
  const addToCart = useCallback((product: Product, quantity = 1) => {
    const image = Array.isArray(product.images) && product.images.length > 0 
      ? product.images[0] 
      : 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop';
    
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        title: product.title,
        price: product.price,
        quantity,
        image
      }];
    });
    
    toast.success(`${product.title} added to cart!`);
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    toast.success('Item removed from cart');
  }, []);

  const updateCartQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.success('Cart cleared');
  }, []);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const contextValue = {
    ...supabaseProducts,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal
  };

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
};
