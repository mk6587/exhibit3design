
import { useState, useEffect } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

import { cache } from '@/lib/cache';

const PRODUCTS_CACHE_KEY = 'products_list';
const PRODUCTS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const useCachedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch products with caching
  const fetchProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('Fetching products with cache...', { forceRefresh, loading });
      
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cachedProducts = cache.get<Product[]>(PRODUCTS_CACHE_KEY);
        if (cachedProducts) {
          console.log('Using cached products:', cachedProducts.length);
          setProducts(cachedProducts);
          setLoading(false);
          return cachedProducts;
        }
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        // Try to use stale cache data as fallback
        const staleData = cache.get<Product[]>(PRODUCTS_CACHE_KEY);
        if (staleData) {
          console.log('Using stale cached data due to error');
          setProducts(staleData);
          return staleData;
        }
        throw error;
      } else {
        console.log('Products fetched successfully:', data?.length || 0);
        const fetchedProducts = data || [];
        
        // Cache the results
        cache.set(PRODUCTS_CACHE_KEY, fetchedProducts, {
          ttl: PRODUCTS_CACHE_TTL,
          persist: true
        });
        
        setProducts(fetchedProducts);
        return fetchedProducts;
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update a product and refresh cache
  const updateProduct = async (updatedProduct: Product) => {
    try {
      console.log('Updating product:', updatedProduct.id);
      
      const { error } = await supabase
        .from('products')
        .update({
          title: updatedProduct.title,
          price: updatedProduct.price,
          description: updatedProduct.description,
          long_description: updatedProduct.long_description,
          specifications: updatedProduct.specifications,
          images: updatedProduct.images,
          tags: updatedProduct.tags,
          file_size: updatedProduct.file_size,
          featured: updatedProduct.featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedProduct.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      // Update local state immediately
      setProducts(prev => 
        prev.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );

      // Update cache with new data
      const updatedProducts = products.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      );
      cache.set(PRODUCTS_CACHE_KEY, updatedProducts, {
        ttl: PRODUCTS_CACHE_TTL,
        persist: true
      });

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  // Get product by ID (with caching)
  const getProductById = (id: number) => {
    return products.find(product => product.id === id);
  };

  // Clear cache and refetch
  const refreshProducts = () => {
    cache.delete(PRODUCTS_CACHE_KEY);
    return fetchProducts(true);
  };

  useEffect(() => {
    console.log('useCachedProducts: Starting initial fetch...');
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    updateProduct,
    getProductById,
    refetch: fetchProducts,
    refreshProducts
  };
};
