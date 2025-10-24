import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";
import ImageViewer from "@/components/ui/image-viewer";
import { Crown } from "lucide-react";
import "@/components/ui/rich-text-editor.css";

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  tags: string[];
  subscription_tier_required?: string;
  is_sample?: boolean;
}
interface ProductCardProps {
  product: Product;
}
const ProductCard = ({
  product
}: ProductCardProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  
  const handleImageClick = (e: React.MouseEvent) => {
    // Only open image viewer on ctrl/cmd+click or right-click
    if (e.ctrlKey || e.metaKey || e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      setIsImageViewerOpen(true);
    }
  };

  // All designs require subscription
  const isPremium = !product.is_sample;

  return (
    <Link to={`/product/${product.id}`} className="block">
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md aspect-[4/3] bg-background animate-fade-in border border-border rounded-none hover:border-primary/20 cursor-pointer">
        {/* Image Container */}
        <div className="relative h-5/6 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title}
            width={800}
            height={600}
            className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-95 group-hover:scale-[1.02]" 
            loading="lazy"
            decoding="async"
            onContextMenu={handleImageClick} 
            onClick={handleImageClick} 
            onError={e => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
            }} 
          />
          
          {/* Premium Badge - Always visible for non-sample designs */}
          {isPremium && (
            <div className="absolute top-2 right-2 z-10">
              <Badge 
                variant="secondary"
                className="bg-amber-500/90 hover:bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-sm border-0 shadow-lg backdrop-blur-sm flex items-center gap-1"
              >
                <Crown className="h-3 w-3" />
                PREMIUM
              </Badge>
            </div>
          )}
        </div>

        {/* Bottom Frame for Product Name */}
        <div className="h-1/6 bg-background border-t border-border flex items-center px-3">
          <h3 className="text-foreground font-normal text-sm sm:text-base group-hover:text-primary transition-colors duration-150 truncate leading-tight md:text-sm">
            {product.title}
          </h3>
        </div>

        <ImageViewer 
          isOpen={isImageViewerOpen} 
          onClose={() => setIsImageViewerOpen(false)} 
          images={[product.image]} 
          title={product.title} 
          initialIndex={0} 
        />
      </Card>
    </Link>
  );
};
export default ProductCard;