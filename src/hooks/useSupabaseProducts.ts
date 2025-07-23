
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

  // Force load database products with REST API fallback
  const fetchProducts = async() => {
    console.log('🔄 Trying multiple approaches to fetch products...');
    
    try {
      // Method 1: Try the standard approach with shorter timeout
      console.log('📡 Method 1: Standard Supabase query...');
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('⏰ Method 1 timeout (3s)');
          resolve({ data: null, error: { message: 'timeout' } });
        }, 3000);
      });
      
      const queryPromise = supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });
      
      const response = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('✅ Method 1 SUCCESS! Found', response.data.length, 'products');
        setProducts(response.data);
        setLoading(false);
        return;
      }
      
      console.log('❌ Method 1 failed, trying Method 2...');
      
      // Method 2: Direct REST API call
      console.log('📡 Method 2: Direct REST API...');
      const restResponse = await fetch('https://fipebdkvzdrljwwxccrj.supabase.co/rest/v1/products?select=*&order=id.asc', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcGViZGt2emRybGp3d3hjY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjczMTAsImV4cCI6MjA2NzMwMzMxMH0.N_48R70OWvLsf5INnGiswao__kjUW6ybYdnPIRm0owk',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcGViZGt2emRybGp3d3hjY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjczMTAsImV4cCI6MjA2NzMwMzMxMH0.N_48R70OWvLsf5INnGiswao__kjUW6ybYdnPIRm0owk'
        }
      });
      
      if (restResponse.ok) {
        const restData = await restResponse.json();
        console.log('✅ Method 2 SUCCESS! Found', restData.length, 'products via REST');
        setProducts(restData);
        setLoading(false);
        return;
      }
      
      console.log('❌ Both methods failed');
      setProducts([]);
      
    } catch (error) {
      console.error('❌ All methods failed:', error);
      setProducts([]);
    }
    
    setLoading(false);
    console.log('✅ Fetch completed');
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

  const createProduct = async (newProduct: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🔄 Creating product with data:', newProduct);
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: newProduct.title,
          price: newProduct.price,
          description: newProduct.description,
          long_description: newProduct.long_description,
          specifications: newProduct.specifications,
          images: newProduct.images,
          tags: newProduct.tags,
          file_size: newProduct.file_size,
          featured: newProduct.featured
        })
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from insert');
      }

      const createdProduct = data[0];
      console.log('✅ Product created successfully:', createdProduct);
      
      setProducts(prev => [...prev, createdProduct]);

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      return createdProduct;
    } catch (error) {
      console.error('💥 Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
      throw error;
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
    createProduct,
    getProductById,
    refetch: fetchProducts
  };
};
