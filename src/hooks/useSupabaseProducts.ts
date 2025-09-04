
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';

// Simple fallback data
const fallbackProducts: Product[] = [
  {
    id: 1,
    title: "Modern Exhibition Stand Design",
    price: 299,
    memo: "This modern exhibition stand design features clean lines and contemporary aesthetics.",
    specifications: '{"dimensions": "6m x 3m", "height": "3m"}',
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop"],
    tags: ["Modern", "Tech", "Minimalist"],
    featured: true
  },
  {
    id: 2,
    title: "Corporate Conference Booth",
    price: 450,
    memo: "This corporate conference booth offers a professional appearance with integrated presentation capabilities.",
    specifications: '{"dimensions": "8m x 4m", "height": "3.5m"}',
    images: ["https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop"],
    tags: ["Corporate", "Professional", "Conference"],
    featured: true
  },
  {
    id: 3,
    title: "Creative Industry Showcase",
    price: 350,
    memo: "This creative showcase stand features bold colors and innovative design elements to attract attention.",
    specifications: '{"dimensions": "5m x 3m", "height": "2.8m"}',
    images: ["https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop"],
    tags: ["Creative", "Design", "Colorful"],
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
          resolve({ data: null, error: { message: 'timeout' } });
        }, 8000);
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
          memo: updatedProduct.memo,
          specifications: updatedProduct.specifications,
          images: updatedProduct.images,
          tags: updatedProduct.tags,
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
      
      // Ensure proper data types for database insertion
      const productData = {
        title: newProduct.title,
        price: Number(newProduct.price),
        memo: newProduct.memo || null,
        specifications: newProduct.specifications || null,
        images: newProduct.images || [],
        tags: newProduct.tags || [],
        featured: newProduct.featured || false
      };
      
      console.log('🔄 Processed product data for DB:', productData);
      
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select();

      if (error) {
        console.error('❌ Supabase error details:', error.message, error.details, error.hint);
        throw new Error(`Database error: ${error.message}`);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error",
        description: `Failed to create product: ${errorMessage}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      console.log('🗑️ Deleting product with ID:', productId);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Product deleted successfully');
      
      setProducts(prev => prev.filter(product => product.id !== productId));

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('💥 Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
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
    deleteProduct,
    getProductById,
    refetch: fetchProducts
  };
};
