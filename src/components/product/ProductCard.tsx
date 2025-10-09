import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";
import ImageViewer from "@/components/ui/image-viewer";
import { Eye, MousePointer2, Lock } from "lucide-react";
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
    if (e.ctrlKey || e.metaKey || e.button === 2) {
      e.preventDefault();
      setIsImageViewerOpen(true);
    }
  };

  // Get tier display name
  const getTierDisplayName = (tier?: string) => {
    if (!tier) return 'Free Sample';
    switch (tier) {
      case 'sample': return 'Free Sample';
      case 'basic': return 'Starter Plan';
      case 'standard': return 'Pro Plan';
      case 'premium': return 'Studio Plan';
      default: return 'Available';
    }
  };

  // Get tier badge color
  const getTierBadgeVariant = (tier?: string) => {
    if (!tier || tier === 'sample') return 'default';
    if (tier === 'basic') return 'secondary';
    if (tier === 'standard') return 'default';
    return 'default';
  };

  const tierName = getTierDisplayName(product.subscription_tier_required);
  const badgeVariant = getTierBadgeVariant(product.subscription_tier_required);
  return <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md aspect-[4/3] bg-background animate-fade-in border border-border rounded-none hover:border-primary/20">
      {/* Image Container */}
      <div className="relative h-5/6 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-95 group-hover:scale-[1.02]" onContextMenu={handleImageClick} onClick={handleImageClick} onError={e => {
          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
        }} />
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
        
        {/* Subscription Tier Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge 
            variant={badgeVariant}
            className="bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-1 rounded-sm border-0 shadow-sm backdrop-blur-sm"
          >
            {tierName}
          </Badge>
        </div>

        {/* Lock Icon for Premium Content */}
        {product.subscription_tier_required && product.subscription_tier_required !== 'sample' && (
          <div className="absolute top-2 right-14 z-10">
            <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-sm">
              <Lock className="h-3 w-3 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Frame for Product Name */}
      <div className="h-1/6 bg-background border-t border-border flex items-center">
        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center px-3">
          <h3 className="text-foreground font-normal text-sm sm:text-base hover:text-primary transition-colors duration-150 truncate leading-tight md:text-sm">
            {product.title}
          </h3>
        </Link>
      </div>

      <ImageViewer isOpen={isImageViewerOpen} onClose={() => setIsImageViewerOpen(false)} images={[product.image]} title={product.title} initialIndex={0} />
    </Card>;
};
export default ProductCard;