import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { initiatePayment } from "@/services/paymentService";
import PrivacyPolicyCheckbox from "@/components/common/PrivacyPolicyCheckbox";

// Mock cart items - in a real app, you'd get these from state management or an API
const cartItems = [
  {
    id: 1,
    title: "Modern Exhibition Stand",
    price: 149,
    quantity: 1,
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Island Exhibition Design",
    price: 249,
    quantity: 1,
    image: "/placeholder.svg",
  },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState("user@example.com"); // In a real app, get from auth state
  const [policyAgreed, setPolicyAgreed] = useState(false);
  
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  useEffect(() => {
    // In a real app, redirect if cart is empty
    if (cartItems.length === 0) {
      navigate("/cart");
      toast.error("Your cart is empty");
    }
  }, [navigate]);
  
  const handlePayment = async () => {
    if (!policyAgreed) {
      toast.error("You must agree to our Privacy Policy to proceed with the payment");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Prepare payment data for YekPay
      const paymentData = {
        amount: subtotal,
        description: "Purchase from ExhibitDesigns",
        callbackUrl: `${window.location.origin}/payment/callback`,
        customerInfo: {
          email: userEmail
        },
        orderItems: cartItems.map(item => ({
          id: item.id,
          name: item.title,
          price: item.price,
          quantity: item.quantity
        }))
      };
      
      // Initiate payment
      const response = await initiatePayment(paymentData);
      
      // In a real app, redirect to YekPay's gateway
      if (response.success) {
        toast.info("Redirecting to payment gateway...");
        
        // Simulate redirect
        setTimeout(() => {
          // This would be a real redirect in production:
          // window.location.href = response.gatewayUrl;
          
          // For demo purposes, we'll just show a success message
          toast.success("Payment simulation successful!");
          navigate("/account/downloads");
        }, 2000);
      } else {
        throw new Error("Payment initiation failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="bg-secondary p-6 rounded-lg mb-8">
            <h2 className="font-semibold text-xl mb-4">Order Summary</h2>
            
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between py-3 border-b last:border-0">
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium">${item.price}</div>
              </div>
            ))}
            
            <div className="pt-4 mt-4 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="border rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-xl mb-4">Payment Information</h2>
            <p className="mb-6">
              You will be redirected to YekPay's secure payment gateway to complete your purchase.
              After successful payment, you will receive access to download your purchased designs.
            </p>
            
            <PrivacyPolicyCheckbox
              checked={policyAgreed}
              onCheckedChange={setPolicyAgreed}
              id="checkout-privacy-policy"
              className="mb-4"
            />
            
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Proceed to Payment"}
            </Button>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Your payment is secure and encrypted</p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              By proceeding with the payment, you agree to our Terms of Service and <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;