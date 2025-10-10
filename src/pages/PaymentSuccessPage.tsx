import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { activateSubscription, updateSubscriptionOrderStatus } from "@/services/subscriptionPaymentService";
import { useProducts } from "@/contexts/ProductsContext";
import { trackPurchase } from "@/services/ga4Analytics";
import { supabase } from "@/integrations/supabase/client";

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
  const planId = searchParams.get('planId'); // For subscription payments

  useEffect(() => {
    const processSuccess = async () => {
      // Log all URL parameters for debugging
      const allParams = Object.fromEntries(searchParams);
      console.log("PaymentSuccessPage - All URL params:", allParams);
      console.log("PaymentSuccessPage - Individual params:", { sessionId, orderNumber, status, authority, reference });
      
      // Prevent double processing
      if (orderProcessed) return;

      try {
        // Handle subscription payment success only
        if (status === 'success' && orderNumber && planId) {
          console.log('Processing subscription payment success', { orderNumber, authority, reference, planId });
          
          try {
            console.log("Processing subscription payment...");
            await updateSubscriptionOrderStatus(orderNumber, 'completed', authority || undefined, reference || undefined);
            await activateSubscription(orderNumber, planId);
            toast.success("Subscription activated successfully!");
            setOrderProcessed(true);
            console.log("Subscription activated successfully");
          } catch (error) {
            console.error("Failed to activate subscription:", error);
            toast.error("There was an issue activating your subscription. Please contact support.");
            setOrderProcessed(true);
          }
        }
        // Fallback: If user reaches this page without proper parameters
        else if (!orderProcessed) {
          console.log('Payment success page accessed without proper subscription parameters');
          setOrderProcessed(true);
          toast.success("Payment completed successfully!");
        }
      } catch (error) {
        console.error("Failed to process payment success:", error);
        toast.error("Payment completed but there was an issue. Please contact support.");
      }
    };

    processSuccess();
  }, [sessionId, orderNumber, status, authority, reference, clearCart, orderProcessed]);


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
                  <strong>Subscription Activated!</strong> Your subscription has been activated and tokens/credits have been added to your account.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/profile')} className="bg-primary hover:bg-primary/90">
                  View Subscription
                </Button>
                <Button onClick={() => navigate('/ai-samples')} variant="outline">
                  Start Editing
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