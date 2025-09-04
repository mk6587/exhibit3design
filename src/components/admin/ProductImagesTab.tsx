
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImageToSupabase, deleteImageFromSupabase } from '@/lib/supabaseStorage';
import imageCompression from 'browser-image-compression';

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
  const [uploading, setUploading] = useState(false);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 4, // Compress to max 4MB for better quality
      maxWidthOrHeight: 1920, // Max dimension
      useWebWorker: true,
      fileType: 'image/jpeg', // Convert to JPEG for better compression
      quality: 0.85 // 85% quality for better image quality
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original if compression fails
    }
  };

  const handleMultipleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      const newImageUrls: string[] = [];
      
      try {
        for (const originalFile of Array.from(files)) {
          // Check if file is an image
          if (!originalFile.type.startsWith('image/')) {
            toast({
              title: "Invalid file type",
              description: `${originalFile.name} is not an image file.`,
              variant: "destructive",
            });
            continue;
          }

          // Compress the image
          const compressedFile = await compressImage(originalFile);

          // Check compressed file size (should be under 4MB now, but double-check)
          if (compressedFile.size > 5 * 1024 * 1024) {
            toast({
              title: "File still too large",
              description: `${originalFile.name} is still too large after compression.`,
              variant: "destructive",
            });
            continue;
          }

          const uploadedUrl = await uploadImageToSupabase(compressedFile);
          if (uploadedUrl) {
            newImageUrls.push(uploadedUrl);
          } else {
            toast({
              title: "Upload failed",
              description: `Failed to upload ${originalFile.name}`,
              variant: "destructive",
            });
          }
        }
        
        if (newImageUrls.length > 0) {
          onImageUrlsChange([...imageUrls, ...newImageUrls]);
          toast({
            title: "Images Uploaded",
            description: `${newImageUrls.length} image(s) compressed and uploaded successfully.`,
          });
        }
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "An error occurred while processing images.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
        event.target.value = '';
      }
    }
  };

  const handleDeleteImage = async (index: number) => {
    const imageUrl = imageUrls[index];
    
    // If it's a Supabase storage URL, delete it from storage
    if (imageUrl.includes('supabase') && imageUrl.includes('/storage/v1/object/public/')) {
      await deleteImageFromSupabase(imageUrl);
    }
    
    const updatedImages = imageUrls.filter((_, i) => i !== index);
    onImageUrlsChange(updatedImages);
    
    toast({
      title: "Image Deleted",
      description: "Image has been removed from the gallery and storage.",
    });
  };

  const convertGoogleDriveUrl = (url: string): string => {
    // Convert Google Drive sharing URL to direct image URL
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    return url;
  };

  const handleAddSpecificUrl = () => {
    if (specificImageUrl.trim()) {
      const processedUrl = convertGoogleDriveUrl(specificImageUrl.trim());
      onImageUrlsChange([...imageUrls, processedUrl]);
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
            <Button 
              variant="outline" 
              disabled={uploading}
              onClick={() => {
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                fileInput?.click();
              }}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploading ? 'Uploading...' : 'Select Images'}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Images are automatically compressed to under 4MB with 85% quality and uploaded to Supabase Storage for permanent hosting.
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
                    // Fallback to a stock image if the URL fails
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop';
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
