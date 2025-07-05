
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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

// Fallback data in case Supabase is not available
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

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from Supabase...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        // Use fallback data if Supabase fails
        setProducts(fallbackProducts);
        console.log('Using fallback products data');
      } else {
        console.log('Products fetched successfully:', data?.length || 0);
        setProducts(data || fallbackProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use fallback data on any error
      setProducts(fallbackProducts);
      console.log('Using fallback products due to error');
    } finally {
      setLoading(false);
    }
  };

  // Update a product
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

      // Update local state
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

  // Get product by ID
  const getProductById = (id: number) => {
    return products.find(product => product.id === id);
  };

  useEffect(() => {
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
