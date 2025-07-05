
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductImagesTabProps {
  imageUrls: string[];
  onImageUrlsChange: (urls: string[]) => void;
  specificImageUrl: string;
  onSpecificImageUrlChange: (url: string) => void;
}

const ProductImagesTab: React.FC<ProductImagesTabProps> = ({
  imageUrls,
  onImageUrlsChange,
  specificImageUrl,
  onSpecificImageUrlChange
}) => {
  const { toast } = useToast();

  const handleMultipleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImageUrls: string[] = [];
      
      Array.from(files).forEach(file => {
        const imageUrl = URL.createObjectURL(file);
        newImageUrls.push(imageUrl);
      });
      
      onImageUrlsChange([...imageUrls, ...newImageUrls]);
      
      toast({
        title: "Images Uploaded",
        description: `${files.length} image(s) have been added to the gallery.`,
      });
      
      event.target.value = '';
    }
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = imageUrls.filter((_, i) => i !== index);
    onImageUrlsChange(updatedImages);
    
    toast({
      title: "Image Deleted",
      description: "Image has been removed from the gallery.",
    });
  };

  const handleAddSpecificUrl = () => {
    if (specificImageUrl.trim()) {
      onImageUrlsChange([...imageUrls, specificImageUrl.trim()]);
      onSpecificImageUrlChange('');
      
      toast({
        title: "Image URL Added",
        description: "Image URL has been added to the gallery.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Upload Multiple Images</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImageUpload}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => {
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              fileInput?.click();
            }}>
              <Upload className="mr-2 h-4 w-4" />
              Select Images
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Select multiple images from your device to add to the product gallery.
          </p>
        </div>

        <div>
          <Label htmlFor="specific-url">Add Image from URL</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              id="specific-url"
              value={specificImageUrl}
              onChange={(e) => onSpecificImageUrlChange(e.target.value)}
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
    </div>
  );
};

export default ProductImagesTab;
