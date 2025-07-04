
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { products } from '@/data/products';

const AdminProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const originalProduct = products.find(p => p.id === parseInt(id!));
  const [product, setProduct] = useState(originalProduct || products[0]);
  const [imageUrls, setImageUrls] = useState(product.images.join('\n'));

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSave = () => {
    // Update images array from textarea
    const updatedProduct = {
      ...product,
      images: imageUrls.split('\n').filter(url => url.trim() !== '')
    };
    setProduct(updatedProduct);
    
    // In a real app, you would save to a database here
    console.log('Saving product:', updatedProduct);
    
    toast({
      title: "Changes Saved",
      description: "Product content has been updated successfully.",
    });
  };

  const handlePreview = () => {
    window.open(`/product/${id}`, '_blank');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/admin')} 
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
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Product Title</Label>
                    <Input
                      id="title"
                      value={product.title}
                      onChange={(e) => setProduct({...product, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={product.price}
                      onChange={(e) => setProduct({...product, price: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="short-description">Short Description</Label>
                    <Textarea
                      id="short-description"
                      value={product.description}
                      onChange={(e) => setProduct({...product, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={product.tags.join(', ')}
                      onChange={(e) => setProduct({...product, tags: e.target.value.split(',').map(tag => tag.trim())})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="file-size">File Size</Label>
                    <Input
                      id="file-size"
                      value={product.fileSize}
                      onChange={(e) => setProduct({...product, fileSize: e.target.value})}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="description" className="space-y-4">
                <div>
                  <Label htmlFor="long-description">Detailed Description (HTML)</Label>
                  <Textarea
                    id="long-description"
                    value={product.longDescription}
                    onChange={(e) => setProduct({...product, longDescription: e.target.value})}
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    You can use HTML tags like &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;h4&gt;, etc.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                <div>
                  <Label htmlFor="specifications">Specifications (HTML)</Label>
                  <Textarea
                    id="specifications"
                    value={product.specifications}
                    onChange={(e) => setProduct({...product, specifications: e.target.value})}
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    You can use HTML tags like &lt;h4&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <div>
                  <Label htmlFor="images">Product Images (one URL per line)</Label>
                  <Textarea
                    id="images"
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    rows={8}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Enter one image URL per line. These will be used in the product gallery.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imageUrls.split('\n').filter(url => url.trim() !== '').map((url, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <img 
                        src={url.trim()} 
                        alt={`Product image ${index + 1}`}
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminProductEditPage;
