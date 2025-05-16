
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

const ProductGallery = ({ images, title }: ProductGalleryProps) => {
  const [activeImage, setActiveImage] = useState(0);
  
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-2 bg-secondary">
        <div className="aspect-[4/3] overflow-hidden rounded">
          <img 
            src={images[activeImage]} 
            alt={`${title} - preview ${activeImage + 1}`}
            className="w-full h-full object-contain"
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
                src={image} 
                alt={`${title} - thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
