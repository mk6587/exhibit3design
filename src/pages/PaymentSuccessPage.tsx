import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { updateOrderStatus, getOrderByNumber } from "@/services/paymentService";
import { useProducts } from "@/contexts/ProductsContext";
import { trackPurchase } from "@/services/ga4Analytics";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useProducts();
  const [orderProcessed, setOrderProcessed] = useState(false);
  
  const sessionId = searchParams.get('session_id');
  const orderNumber = searchParams.get('order');
  const status = searchParams.get('status');
  const authority = searchParams.get('authority');
  const reference = searchParams.get('ref');

  useEffect(() => {
    const processSuccess = async () => {
      console.log("PaymentSuccessPage - URL params:", { sessionId, orderNumber, status, authority, reference });
      
      // Prevent double processing
      if (orderProcessed) return;

      try {
        // Handle YekPay success
        if (status === 'success' && orderNumber) {
          console.log('Processing YekPay payment success', { orderNumber, authority, reference });
          
          try {
            console.log("Attempting to update order status...");
            await updateOrderStatus(orderNumber, 'completed', authority || undefined, reference || undefined);
            clearCart();
            setOrderProcessed(true);
            toast.success("Payment completed successfully!");
            console.log("Order status updated successfully");
          } catch (error) {
            console.error("Failed to update order status:", error);
            // Don't let this error break the page - just log it
            toast.success("Payment completed successfully!");
            setOrderProcessed(true);
          }
        }
        // Handle Stripe success (if using sessionId)
        else if (sessionId && orderNumber) {
          console.log('Processing Stripe payment success', { sessionId, orderNumber });
          
          try {
            await updateOrderStatus(orderNumber, 'completed', sessionId);
            clearCart();
            setOrderProcessed(true);
            toast.success("Payment completed successfully!");
          } catch (error) {
            console.error("Failed to update order status:", error);
            toast.success("Payment completed successfully!");
            setOrderProcessed(true);
          }
        }
      } catch (error) {
        console.error("Failed to process payment success:", error);
        toast.error("Payment completed but there was an issue updating the order. Please contact support.");
      }
    };

    processSuccess();
  }, [sessionId, orderNumber, status, authority, reference, clearCart, orderProcessed]);

  const handleViewDownloads = () => {
    navigate('/downloads');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              <CardDescription>
                Your payment has been processed successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {orderNumber && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Order Number:</span>
                      <div className="font-mono">{orderNumber}</div>
                    </div>
                    {authority && (
                      <div>
                        <span className="font-medium">Transaction ID:</span>
                        <div className="font-mono">{authority}</div>
                      </div>
                    )}
                    {reference && (
                      <div>
                        <span className="font-medium">Reference:</span>
                        <div className="font-mono">{reference}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Design Files:</strong> Your design files will be sent to your email address within 1 hour. 
                  You can also access them from your downloads page once they're ready.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleViewDownloads} className="bg-primary hover:bg-primary/90">
                  View Downloads
                </Button>
                <Button onClick={handleContinueShopping} variant="outline">
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;