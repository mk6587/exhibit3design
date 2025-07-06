
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
  },
  {
    id: 4,
    title: "Industrial Trade Fair Stand",
    price: 550,
    description: "Robust industrial design for manufacturing and heavy industry exhibitions.",
    long_description: "<p>This industrial trade fair stand is built for durability and showcases heavy machinery and industrial products.</p>",
    specifications: JSON.stringify({
      dimensions: "10m x 5m",
      height: "4m",
      layout: "Heavy-duty display area",
      lighting: "Industrial spotlights",
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
    images: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop"],
    tags: ["Industrial", "Manufacturing", "Heavy-duty"],
    file_size: "65MB",
    featured: true
  },
  {
    id: 5,
    title: "Startup Innovation Hub",
    price: 275,
    description: "Compact and efficient design perfect for startups and small businesses.",
    long_description: "<p>This startup innovation hub maximizes space efficiency while providing all essential features for emerging businesses.</p>",
    specifications: JSON.stringify({
      dimensions: "4m x 2.5m",
      height: "2.5m",
      layout: "Compact efficiency",
      lighting: "Modern LED strips",
      specifications: {
        infoDesk: true,
        storage: true,
        screen: true,
        kitchen: false,
        seatingArea: false,
        meetingRoom: false,
        hangingBanner: true
      }
    }),
    images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"],
    tags: ["Startup", "Compact", "Innovative"],
    file_size: "28MB",
    featured: false
  },
  {
    id: 6,
    title: "Luxury Brand Pavilion",
    price: 750,
    description: "Premium luxury design for high-end brands and exclusive product launches.",
    long_description: "<p>This luxury brand pavilion features premium materials and sophisticated design elements for prestigious brand presentations.</p>",
    specifications: JSON.stringify({
      dimensions: "12m x 6m",
      height: "4.5m",
      layout: "Luxury showcase",
      lighting: "Premium ambient lighting",
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
    images: ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop"],
    tags: ["Luxury", "Premium", "Exclusive"],
    file_size: "78MB",
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
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        setProducts(fallbackProducts);
      } else {
        setProducts(data || fallbackProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(fallbackProducts);
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

      // Update local state immediately
      setProducts(prev => 
        prev.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );

      // Refetch products to ensure all components get updated data
      await fetchProducts();

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
