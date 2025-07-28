
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useProducts } from '@/contexts/ProductsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import ProductBasicInfoTab from '@/components/admin/ProductBasicInfoTab';

import ProductSpecificationsTab from '@/components/admin/ProductSpecificationsTab';
import ProductImagesTab from '@/components/admin/ProductImagesTab';

const AdminProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAdmin();
  const { getProductById, updateProduct, loading } = useProducts();
  const navigate = useNavigate();
  const { toast } = useToast();

  const originalProduct = getProductById(parseInt(id!));
  const [product, setProduct] = useState<Product>(originalProduct || {
    id: 1,
    title: '',
    price: 0,
    memo: '',
    specifications: '',
    images: [],
    tags: [],
    featured: false
  });
  const [imageUrls, setImageUrls] = useState(product.images);
  const [specificImageUrl, setSpecificImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (originalProduct) {
      setProduct(originalProduct);
      setImageUrls(originalProduct.images);
    }
  }, [originalProduct]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedProduct = {
        ...product,
        images: imageUrls
      };
      
      await updateProduct(updatedProduct);
      setProduct(updatedProduct);
      
      console.log('Saving product:', updatedProduct);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please check your permissions.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`/product/${id}`, '_blank');
  };

  const handleAIContentGenerated = (content: string, field: string) => {
    if (field === 'memo') {
      setProduct({...product, memo: content});
    } else if (field === 'specifications') {
      setProduct({...product, specifications: content});
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/admin/dashboard')} 
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handlePreview} variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Content Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <ProductBasicInfoTab
                  product={product}
                  onProductChange={setProduct}
                  onAIContentGenerated={handleAIContentGenerated}
                />
              </TabsContent>

              <TabsContent value="specifications">
                <ProductSpecificationsTab
                  product={product}
                  onProductChange={setProduct}
                  onAIContentGenerated={handleAIContentGenerated}
                />
              </TabsContent>

              <TabsContent value="images">
                <ProductImagesTab
                  imageUrls={imageUrls}
                  onImageUrlsChange={setImageUrls}
                  specificImageUrl={specificImageUrl}
                  onSpecificImageUrlChange={setSpecificImageUrl}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminProductEditPage;
