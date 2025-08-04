
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
    <Card className="group overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-sm hover:-translate-y-[2px] aspect-[4/3] relative bg-background animate-fade-in md:hover:border-primary/50 mobile-product-card">
      {/* Full Coverage Image */}
      <Link to={`/product/${product.id}`} className="block w-full h-full">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-95 md:group-hover:scale-[1.02]"
          onContextMenu={handleImageClick}
          onClick={handleImageClick}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
          }}
        />
      </Link>
      
      {/* Clickable Indicators - Hidden on mobile for cleaner look */}
      <div className="absolute top-3 right-3 flex gap-2 hidden md:flex z-10">
        <div className="bg-background border border-border p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-200 animate-scale-in">
          <Eye className="h-3 w-3 text-foreground" />
        </div>
        <div className="bg-background border border-border p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-200 animate-scale-in">
          <MousePointer2 className="h-3 w-3 text-foreground" />
        </div>
      </div>

      {/* Price Badge - Consistent sizing */}
      <div className="absolute top-3 left-3 z-10">
        <Badge variant="secondary" className="bg-background border border-flat-border text-foreground text-sm font-semibold px-3 py-1.5 rounded-md shadow-sm">
          €{product.price}
        </Badge>
      </div>

      {/* Title Overlay - Bottom of card */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 z-10">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-white font-semibold text-sm md:text-base hover:text-primary-foreground transition-all duration-150 line-clamp-2">
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
