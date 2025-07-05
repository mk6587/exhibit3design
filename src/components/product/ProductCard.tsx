
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";
import ImageViewer from "@/components/ui/image-viewer";
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
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    // Only show image viewer if clicked with modifier key (Ctrl/Cmd) or right-click
    if (e.ctrlKey || e.metaKey || e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      setIsViewerOpen(true);
    }
    // Otherwise, let the Link handle navigation to product detail page
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[4/3] overflow-hidden bg-secondary clickable-image-container">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-full object-cover transition-transform hover:scale-105 cursor-pointer"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
        }}
        onClick={handleImageClick}
      />
        </div>
      </Link>
      <CardContent className="pt-4">
        <Link to={`/product/${product.id}`} className="hover:underline">
          <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
        </Link>
        <div className="flex flex-wrap gap-1 mb-2">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <span className="font-semibold">${product.price}</span>
        <Link 
          to={`/product/${product.id}`} 
          className="text-primary hover:underline"
        >
          View Details
        </Link>
      </CardFooter>

      <ImageViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        images={[product.image]}
        title={product.title}
      />
    </Card>
  );
};

export default ProductCard;
