
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/contexts/ProductsContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import { trackAddToCart } from "@/services/ga4Analytics";

interface AddToCartButtonProps {
  productId: number;
  productName: string;
}

const AddToCartButton = ({ productId, productName }: AddToCartButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getProductById, addToCart } = useProducts();
  
  const handleAddToCart = () => {
    const product = getProductById(productId);
    if (!product) {
      toast.error("Product not found");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate brief loading for UX
    setTimeout(() => {
      addToCart(product);
      
      // Track GA4 add_to_cart event
      trackAddToCart(product, 1);
      
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <ErrorBoundary>
      <Button 
        onClick={handleAddToCart} 
        disabled={isLoading}
        className="w-full"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isLoading ? "Adding..." : "Add to Cart"}
      </Button>
    </ErrorBoundary>
  );
};

export default AddToCartButton;
