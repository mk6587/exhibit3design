import { useState, useEffect } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import Layout from "@/components/layout/Layout";
import CartItem from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import ErrorBoundary from "@/components/ui/error-boundary";
import { trackViewCart } from "@/services/ga4Analytics";

const CartPage = () => {
  const { cartItems, removeFromCart, updateCartQuantity, cartTotal } = useProducts();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Scroll to top when cart page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track view_cart when cart is viewed
  useEffect(() => {
    if (cartItems.length > 0) {
      trackViewCart(cartItems, cartTotal);
    }
  }, [cartItems, cartTotal]);
  const navigate = useNavigate();
  
  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
  };
  
  const handleUpdateQuantity = (id: number, quantity: number) => {
    updateCartQuantity(id, quantity);
  };
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // Simulate checkout process
    setTimeout(() => {
      console.log("Starting checkout process with the following items:", cartItems);
      navigate("/checkout");
      setIsCheckingOut(false);
    }, 1500);
  };
  
  // Calculate cart totals
  const subtotal = cartTotal;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {cartItems.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>
            
            <div>
              <div className="bg-secondary p-6 rounded-lg">
                <h2 className="font-semibold text-xl mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                
                <Button
                  className="w-full mt-6"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? "Processing..." : "Checkout"}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Secure checkout powered by Stripe
                </p>
              </div>
              
              <div className="mt-4">
                <Link to="/products" className="text-primary text-sm hover:underline">
                  ← Continue shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any designs to your cart yet.
            </p>
            <Button asChild>
              <Link to="/products">Browse Designs</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
