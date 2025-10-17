import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductsContext';
import { Product } from '@/hooks/useSupabaseProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save } from 'lucide-react';
import ProductBasicInfoTab from '@/components/admin/ProductBasicInfoTab';
import ProductSpecificationsTab from '@/components/admin/ProductSpecificationsTab';
import ProductImagesTab from '@/components/admin/ProductImagesTab';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';

const AdminProductCreatePage = () => {
  const { createProduct, refetch } = useProducts();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Omit<Product, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    price: 0,
    memo: '',
    specifications: '',
    images: [],
    tags: [],
    featured: false
  });
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!product.title.trim()) {
        toast.error('Product title is required');
        return;
      }
      
      if (product.price <= 0) {
        toast.error('Product price must be greater than 0');
        return;
      }

      // Update product with current image URLs
      const productToSave = {
        ...product,
        images: imageUrls
      };

      const createdProduct = await createProduct(productToSave);
      
      if (createdProduct) {
        // Refetch products to ensure all views are updated
        await refetch();
        toast.success('Product created successfully!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIContentGenerated = (content: string, field: string) => {
    setProduct(prev => ({
      ...prev,
      [field]: content
    }));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/admin')} 
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
            <h1 className="text-3xl font-bold">Create New Product</h1>
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Creating...' : 'Create Product'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Fill in the details for your new exhibition stand design</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <ProductBasicInfoTab 
                  product={product as any} 
                  onProductChange={setProduct as any}
                  onAIContentGenerated={handleAIContentGenerated}
                />
              </TabsContent>
              
              <TabsContent value="specifications" className="space-y-4">
                <ProductSpecificationsTab 
                  product={product as any} 
                  onProductChange={setProduct as any}
                  onAIContentGenerated={handleAIContentGenerated}
                />
              </TabsContent>
              
              <TabsContent value="images" className="space-y-4">
                <ProductImagesTab 
                  imageUrls={imageUrls}
                  onImageUrlsChange={setImageUrls}
                  specificImageUrl=""
                  onSpecificImageUrlChange={() => {}}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProductCreatePage;