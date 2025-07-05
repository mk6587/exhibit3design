
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

const ProductGallery = ({ images, title }: ProductGalleryProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const getImageSrc = (image: string, index: number) => {
    if (imageErrors[index]) {
      return "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
    }
    return image;
  };
  
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-2 bg-secondary">
        <div className="aspect-[4/3] overflow-hidden rounded">
          <img 
            src={getImageSrc(images[activeImage], activeImage)} 
            alt={`${title} - preview ${activeImage + 1}`}
            className="w-full h-full object-contain"
            onError={() => handleImageError(activeImage)}
          />
        </div>
      </Card>
      
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`aspect-[4/3] overflow-hidden rounded ${
                activeImage === index 
                  ? "ring-2 ring-primary" 
                  : "ring-1 ring-border hover:ring-primary/50"
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
    </div>
  );
};

export default ProductGallery;
