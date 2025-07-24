import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageViewer from "@/components/ui/image-viewer";
import { Eye, MousePointer2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  tags: string[];
}

interface ProductCardPreviewProps {
  product: Product;
}

const ProductCardPreview = ({ product }: ProductCardPreviewProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey || e.button === 2) {
      e.preventDefault();
      setIsImageViewerOpen(true);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg h-80">
      {/* Image Section - Takes most of the card */}
      <div className="relative h-60 overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onContextMenu={handleImageClick}
            onClick={handleImageClick}
          />
        </Link>
        
        {/* Clickable Indicators */}
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Eye className="h-3 w-3" />
          </div>
          <div className="bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <MousePointer2 className="h-3 w-3" />
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            ${product.price}
          </Badge>
        </div>
      </div>

      {/* Compact Bottom Section */}
      <div className="p-3 space-y-2">
        {/* Small Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Compact Tags */}
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
              {tag}
            </Badge>
          ))}
          {product.tags.length > 2 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              +{product.tags.length - 2}
            </Badge>
          )}
        </div>
      </div>

      <ImageViewer
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        images={[product.image]}
        title={product.title}
        initialIndex={0}
      />
    </Card>
  );
};

export default ProductCardPreview;