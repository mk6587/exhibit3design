
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cache } from '@/lib/cache';
import { Product } from '@/hooks/useSupabaseProducts';

const PRODUCTS_CACHE_KEY = 'products_list';
const PRODUCTS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Fallback data in case everything fails
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
  }
];

export const useCachedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch products with caching
  const fetchProducts = async (forceRefresh = false) => {
    try {
      console.log('Fetching products with cache...', { forceRefresh });
      
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cachedProducts = cache.get<Product[]>(PRODUCTS_CACHE_KEY);
        if (cachedProducts && Array.isArray(cachedProducts) && cachedProducts.length > 0) {
          console.log('Using cached products:', cachedProducts.length);
          setProducts(cachedProducts);
          setLoading(false);
          return cachedProducts;
        }
      }

      // Fetch from Supabase
      console.log('Fetching from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        // Use fallback on error
        console.log('Using fallback products due to Supabase error');
        setProducts(fallbackProducts);
        setLoading(false);
        return fallbackProducts;
      }

      const fetchedProducts = data || [];
      console.log('Products fetched successfully:', fetchedProducts.length);
      console.log('First product:', fetchedProducts[0]);
      
      // Always use fetched data if available, otherwise fallback
      const productsToUse = fetchedProducts.length > 0 ? fetchedProducts : fallbackProducts;
      
      // Cache the data
      cache.set(PRODUCTS_CACHE_KEY, productsToUse, {
        ttl: PRODUCTS_CACHE_TTL,
        persist: true
      });
      
      setProducts(productsToUse);
      setLoading(false);
      return productsToUse;
      
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Try to use any cached data as fallback
      const fallbackData = cache.get<Product[]>(PRODUCTS_CACHE_KEY);
      if (fallbackData && Array.isArray(fallbackData) && fallbackData.length > 0) {
        console.log('Using fallback cached data');
        setProducts(fallbackData);
      } else {
        console.log('Using hardcoded fallback data');
        setProducts(fallbackProducts);
        cache.set(PRODUCTS_CACHE_KEY, fallbackProducts, {
          ttl: PRODUCTS_CACHE_TTL,
          persist: true
        });
      }
      setLoading(false);
      return fallbackProducts;
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
      const updatedProducts = products.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      );
      setProducts(updatedProducts);

      // Update cache with new data
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
    const product = products.find(product => product.id === id);
    console.log('Getting product by ID:', id, 'Found:', !!product);
    return product;
  };

  // Clear cache and refetch
  const refreshProducts = () => {
    console.log('Refreshing products - clearing cache');
    cache.delete(PRODUCTS_CACHE_KEY);
    setLoading(true);
    return fetchProducts(true);
  };

  useEffect(() => {
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
