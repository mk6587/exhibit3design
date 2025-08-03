
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";
import ImageViewer from "@/components/ui/image-viewer";
import { Eye, MousePointer2 } from "lucide-react";
import "@/components/ui/rich-text-editor.css";

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  tags: string[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey || e.button === 2) {
      e.preventDefault();
      setIsImageViewerOpen(true);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:border-primary/50 aspect-square flex flex-col bg-background">
      {/* Square Image Section */}
      <div className="relative flex-1 overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-200 group-hover:opacity-90"
            onContextMenu={handleImageClick}
            onClick={handleImageClick}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
            }}
          />
        </Link>
        
        {/* Clickable Indicators */}
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="bg-background border border-border p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Eye className="h-3 w-3 text-foreground" />
          </div>
          <div className="bg-background border border-border p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <MousePointer2 className="h-3 w-3 text-foreground" />
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background border border-border text-foreground rounded-sm">
            €{product.price}
          </Badge>
        </div>
      </div>

      {/* Compact Bottom Section */}
      <div className="p-4 border-t border-border">
        {/* Small Title Only */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
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

export default ProductCard;
