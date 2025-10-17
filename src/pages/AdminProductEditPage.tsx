
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import ProductBasicInfoTab from '@/components/admin/ProductBasicInfoTab';
import ProductSpecificationsTab from '@/components/admin/ProductSpecificationsTab';
import ProductImagesTab from '@/components/admin/ProductImagesTab';
import { AdminLayout } from '@/components/admin/AdminLayout';

const AdminProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
            <h1 className="text-3xl font-bold">Edit Product</h1>
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
      </div>
    </AdminLayout>
  );
};

export default AdminProductEditPage;
