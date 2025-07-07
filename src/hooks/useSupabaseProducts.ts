
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  long_description: string;
  specifications: string;
  images: string[];
  tags: string[];
  file_size: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

// Simple fallback data
const fallbackProducts: Product[] = [
  {
    id: 1,
    title: "Modern Exhibition Stand Design",
    price: 299,
    description: "A sleek and modern exhibition stand perfect for tech companies and startups.",
    long_description: "<p>This modern exhibition stand design features clean lines and contemporary aesthetics.</p>",
    specifications: '{"dimensions": "6m x 3m", "height": "3m"}',
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
    specifications: '{"dimensions": "8m x 4m", "height": "3.5m"}',
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
    specifications: '{"dimensions": "5m x 3m", "height": "2.8m"}',
    images: ["https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop"],
    tags: ["Creative", "Design", "Colorful"],
    file_size: "38MB",
    featured: false
  }
];

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Force load database products
  const fetchProducts = async() => {
    console.log('🔄 Fetching database products...');
    
    try {
      // Add timeout protection and try both approaches
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('⏰ Timeout reached, query taking too long');
          resolve({ data: null, error: { message: 'timeout' } });
        }, 5000);
      });
      
      const queryPromise = supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });
      
      console.log('📡 Starting query...');
      const response = await Promise.race([queryPromise, timeoutPromise]) as any;
      console.log('📊 Query completed:', response);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('✅ SUCCESS! Found', response.data.length, 'products');
        console.log('📋 First product:', response.data[0]?.title);
        setProducts(response.data);
      } else {
        console.log('❌ No valid data received:', response.error || 'No data');
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Catch error:', error);
      setProducts([]);
    }
    
    setLoading(false);
    console.log('✅ Fetch completed, loading set to false');
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
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

      if (error) throw error;

      setProducts(prev => 
        prev.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );

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

  const getProductById = (id: number) => {
    return products.find(product => product.id === id);
  };

  useEffect(() => {
    console.log('🚀 Products hook initialized');
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    updateProduct,
    getProductById,
    refetch: fetchProducts
  };
};
