
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
    <Card className="group overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-sm hover:-translate-y-[2px] aspect-[4/3] flex flex-col bg-background animate-fade-in md:hover:border-primary/50 mobile-product-card">
      {/* Image Section - Takes up most of the card */}
      <div className="relative flex-1 overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.title}
            className="mobile-product-image transition-all duration-300 group-hover:opacity-95 md:group-hover:scale-[1.02]"
            onContextMenu={handleImageClick}
            onClick={handleImageClick}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
            }}
          />
        </Link>
        
        {/* Clickable Indicators - Hidden on mobile for cleaner look */}
        <div className="absolute top-3 right-3 flex gap-2 hidden md:flex">
          <div className="bg-background border border-border p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-200 animate-scale-in">
            <Eye className="h-3 w-3 text-foreground" />
          </div>
          <div className="bg-background border border-border p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-200 animate-scale-in">
            <MousePointer2 className="h-3 w-3 text-foreground" />
          </div>
        </div>

        {/* Price Badge - Mobile optimized */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3">
          <Badge variant="secondary" className="bg-background border border-flat-border text-foreground text-xs md:text-sm font-bold px-2 py-1 rounded-md">
            €{product.price}
          </Badge>
        </div>
      </div>

      {/* Compact Bottom Section - Mobile optimized */}
      <div className="mobile-product-content border-t border-flat-border">
        {/* Small Title Only */}
        <Link to={`/product/${product.id}`}>
          <h3 className="mobile-product-title hover:text-primary transition-all duration-150">
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
