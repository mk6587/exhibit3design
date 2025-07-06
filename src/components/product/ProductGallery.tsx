
import { useState } from "react";
import { Card } from "@/components/ui/card";
import ImageViewer from "@/components/ui/image-viewer";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

const ProductGallery = ({ images, title }: ProductGalleryProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const getImageSrc = (image: string, index: number) => {
    if (imageErrors[index] || image.startsWith('blob:')) {
      // Use fallback for broken images or blob URLs
      return "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
    }
    return image;
  };

  const handleImageClick = () => {
    setIsViewerOpen(true);
  };

  // Get valid images for the viewer
  const validImages = images.map((image, index) => getImageSrc(image, index));
  
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-2 bg-secondary">
        <div className="aspect-[4/3] overflow-hidden rounded cursor-pointer hover:opacity-90 transition-opacity clickable-image-container">
          <img 
            src={getImageSrc(images[activeImage], activeImage)} 
            alt={`${title} - preview ${activeImage + 1}`}
            className="w-full h-full object-contain"
            onError={() => handleImageError(activeImage)}
            onClick={handleImageClick}
          />
        </div>
      </Card>
      
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`aspect-[4/3] overflow-hidden rounded transition-all duration-200 ${
                activeImage === index 
                  ? "ring-2 ring-primary" 
                  : "ring-1 ring-border hover:ring-primary/50 hover:scale-105"
              }`}
            >
              <img 
                src={getImageSrc(image, index)} 
                alt={`${title} - thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}

      <ImageViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        images={validImages}
        initialIndex={activeImage}
        title={title}
      />
    </div>
  );
};

export default ProductGallery;
