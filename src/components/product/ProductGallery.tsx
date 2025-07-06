import { useState } from "react";
import { Card } from "@/components/ui/card";
import ImageViewer from "@/components/ui/image-viewer";
import CachedImage from "@/components/ui/cached-image";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

const ProductGallery = ({ images, title }: ProductGalleryProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleImageClick = () => {
    setIsViewerOpen(true);
  };

  // Get valid images for the viewer
  const validImages = images.map((image, index) => 
    image && !image.startsWith('blob:') 
      ? image 
      : "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop"
  );
  
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-2 bg-secondary">
        <div className="aspect-[4/3] overflow-hidden rounded cursor-pointer hover:opacity-90 transition-opacity clickable-image-container">
          <CachedImage
            src={validImages[activeImage]} 
            alt={`${title} - preview ${activeImage + 1}`}
            className="w-full h-full object-contain"
            onClick={handleImageClick}
            skeletonClassName="w-full h-full rounded"
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
              <CachedImage
                src={validImages[index]} 
                alt={`${title} - thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                skeletonClassName="w-full h-full"
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
