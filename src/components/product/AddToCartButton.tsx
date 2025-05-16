
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: number;
  productName: string;
}

const AddToCartButton = ({ productId, productName }: AddToCartButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddToCart = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Add to cart logic would go here
      console.log(`Added product ${productId} to cart`);
      
      toast.success(`${productName} added to your cart!`, {
        description: "Go to cart to complete your purchase",
        action: {
          label: "View Cart",
          onClick: () => window.location.href = "/cart"
        },
      });
      
      setIsLoading(false);
    }, 800);
  };
  
  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={isLoading}
      className="w-full"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  );
};

export default AddToCartButton;
