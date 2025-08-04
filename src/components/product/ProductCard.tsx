
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
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-sm aspect-[4/3] bg-background animate-fade-in border border-border rounded-none">
      {/* Full Coverage Image Container - Larger viewport */}
      <div className="relative h-5/6 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-95"
            onContextMenu={handleImageClick}
            onClick={handleImageClick}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
            }}
          />
        </Link>
        
        {/* Price Badge - Small and minimal */}
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-white text-black text-xs font-medium px-2 py-0.5 rounded-none border-0 shadow-sm">
            €{product.price}
          </Badge>
        </div>
      </div>

      {/* Compact Bottom Section for Title */}
      <div className="h-1/6 flex items-center px-2 py-1 bg-background">
        <Link to={`/product/${product.id}`} className="w-full">
          <h3 className="text-foreground font-normal text-sm hover:text-primary transition-colors duration-150 truncate">
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
