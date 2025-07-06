
import { useState, useEffect } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

import { cache } from '@/lib/cache';

const PRODUCTS_CACHE_KEY = 'products_list';
const PRODUCTS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Fallback data for immediate display
const fallbackProducts: Product[] = [
  {
    id: 1,
    title: "Modern Exhibition Stand Design",
    price: 299,
    description: "A sleek and modern exhibition stand perfect for tech companies and startups.",
    long_description: "<p>This modern exhibition stand design features clean lines and contemporary aesthetics.</p>",
    specifications: JSON.stringify({
      dimensions: "6m x 3m",
      height: "3m",
      layout: "Open concept",
      lighting: "LED spotlights",
      specifications: {
        infoDesk: true,
        storage: true,
        screen: true,
        kitchen: false,
        seatingArea: true,
        meetingRoom: false,
        hangingBanner: true
      }
    }),
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop"],
    tags: ["Modern", "Tech", "Minimalist"],
    file_size: "45MB",
    featured: true
  },
  {
    id: 2,
    title: "Corporate Conference Booth",
    price: 450,
    description: "Professional conference booth designed for corporate presentations and networking.",
    long_description: "<p>This corporate conference booth offers a professional appearance with integrated presentation capabilities.</p>",
    specifications: JSON.stringify({
      dimensions: "8m x 4m",
      height: "3.5m",
      layout: "Enclosed presentation area",
      lighting: "Professional conference lighting",
      specifications: {
        infoDesk: true,
        storage: true,
        screen: true,
        kitchen: true,
        seatingArea: true,
        meetingRoom: true,
        hangingBanner: true
      }
    }),
    images: ["https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop"],
    tags: ["Corporate", "Professional", "Conference"],
    file_size: "52MB",
    featured: true
  },
  {
    id: 3,
    title: "Creative Industry Showcase",
    price: 350,
    description: "Vibrant and creative stand perfect for design agencies and creative businesses.",
    long_description: "<p>This creative showcase stand features bold colors and innovative design elements to attract attention.</p>",
    specifications: JSON.stringify({
      dimensions: "5m x 3m",
      height: "2.8m",
      layout: "Open creative space",
      lighting: "Colorful LED displays",
      specifications: {
        infoDesk: true,
        storage: false,
        screen: true,
        kitchen: false,
        seatingArea: true,
        meetingRoom: false,
        hangingBanner: true
      }
    }),
    images: ["https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop"],
    tags: ["Creative", "Design", "Colorful"],
    file_size: "38MB",
    featured: false
  }
];

export const useCachedProducts = () => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
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
