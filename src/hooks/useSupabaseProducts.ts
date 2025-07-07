
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
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Force load database products
  const fetchProducts = async() => {
    console.log('🔄 Force fetching database products...');
    
    try {
      // Direct query without any complications
      const response = await supabase
        .from('products')
        .select('*');
      
      console.log('📊 Raw response:', response);
      
      if (response.data && response.data.length > 0) {
        console.log('✅ SUCCESS! Found', response.data.length, 'products in database');
        console.log('📋 Products:', response.data.map(p => p.title));
        setProducts(response.data);
      } else if (response.error) {
        console.error('❌ Database error:', response.error);
      } else {
        console.log('⚠️ No data returned from database');
      }
    } catch (error) {
      console.error('❌ Catch error:', error);
    }
    
    setLoading(false);
    console.log('✅ Fetch attempt completed');
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
