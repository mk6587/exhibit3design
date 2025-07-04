import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, Upload, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { products } from '@/data/products';
import RichTextEditor from '@/components/ui/rich-text-editor';

const AdminProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const originalProduct = products.find(p => p.id === parseInt(id!));
  const [product, setProduct] = useState(originalProduct || products[0]);
  const [imageUrls, setImageUrls] = useState(product.images);
  const [specificImageUrl, setSpecificImageUrl] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a URL for the uploaded file (in a real app, you'd upload to a server/CDN)
      const imageUrl = URL.createObjectURL(file);
      setImageUrls([...imageUrls, imageUrl]);
      
      toast({
        title: "Image Uploaded",
        description: "Image has been added to the gallery.",
      });
    }
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedImages);
    
    toast({
      title: "Image Deleted",
      description: "Image has been removed from the gallery.",
    });
  };

  const handleAddSpecificUrl = () => {
    if (specificImageUrl.trim()) {
      setImageUrls([...imageUrls, specificImageUrl.trim()]);
      setSpecificImageUrl('');
      
      toast({
        title: "Image URL Added",
        description: "Image URL has been added to the gallery.",
      });
    }
  };

  const handleSave = () => {
    // Update images array
    const updatedProduct = {
      ...product,
      images: imageUrls
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
                  <Label htmlFor="long-description">Detailed Description</Label>
                  <RichTextEditor
                    value={product.longDescription}
                    onChange={(value) => setProduct({...product, longDescription: value})}
                    placeholder="Enter detailed product description..."
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Use the rich text editor to format your product description with headings, lists, and styling.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                <div>
                  <Label htmlFor="specifications">Specifications</Label>
                  <RichTextEditor
                    value={product.specifications}
                    onChange={(value) => setProduct({...product, specifications: value})}
                    placeholder="Enter product specifications..."
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Use the rich text editor to format your specifications with headings and lists.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Upload New Image</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={() => document.querySelector('input[type="file"]')?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload images from your device to add to the product gallery.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="specific-url">Add Image from URL</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="specific-url"
                        value={specificImageUrl}
                        onChange={(e) => setSpecificImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button onClick={handleAddSpecificUrl} variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add URL
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter a specific image URL to add to the gallery.
                    </p>
                  </div>

                  <div>
                    <Label>Current Images ({imageUrls.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative border rounded-lg overflow-hidden group">
                          <img 
                            src={url} 
                            alt={`Product image ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate">
                            {url.startsWith('blob:') ? 'Uploaded file' : url}
                          </div>
                        </div>
                      ))}
                    </div>
                    {imageUrls.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No images uploaded yet. Use the upload button or add a URL to get started.
                      </div>
                    )}
                  </div>
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
