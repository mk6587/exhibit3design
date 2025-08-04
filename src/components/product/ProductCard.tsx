
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
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md aspect-[4/3] bg-background animate-fade-in border border-border rounded-none hover:border-primary/20">
      {/* Full Coverage Image Container - Larger viewport */}
      <div className="relative h-5/6 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-95 group-hover:scale-[1.02]"
            onContextMenu={handleImageClick}
            onClick={handleImageClick}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
            }}
          />
        </Link>
        
        {/* Hover Indicator Icons */}
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <div className="bg-white border border-border px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-200 animate-scale-in">
            <Eye className="h-3 w-3 text-foreground" />
          </div>
          <div className="bg-white border border-border px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-200 animate-scale-in">
            <MousePointer2 className="h-3 w-3 text-foreground" />
          </div>
        </div>
        
        {/* Price Badge - Small and minimal */}
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-white text-black text-xs font-medium px-2 py-0.5 rounded-none border-0 shadow-sm">
            €{product.price}
          </Badge>
        </div>
      </div>

      {/* Responsive Bottom Section for Title */}
      <div className="h-1/6 flex items-center justify-start px-2 sm:px-3 py-1 sm:py-2 bg-background">
        <Link to={`/product/${product.id}`} className="w-full">
          <h3 className="text-foreground font-normal text-xs sm:text-sm hover:text-primary transition-colors duration-150 truncate text-left leading-tight">
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
