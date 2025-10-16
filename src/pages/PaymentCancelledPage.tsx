import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { updateSubscriptionOrderStatus } from "@/services/subscriptionPaymentService";

const PaymentCancelledPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const status = searchParams.get('status');
  const orderNumber = searchParams.get('order_number');
  const authority = searchParams.get('authority');
  const planId = searchParams.get('planId');

  useEffect(() => {
    const processCancellation = async () => {
      console.log("PaymentCancelledPage - URL params:", { status, orderNumber, authority });
      
      if (status === 'cancelled' && orderNumber && planId) {
        try {
          console.log("Attempting to update subscription order status...");
          await updateSubscriptionOrderStatus(orderNumber, 'cancelled', authority || undefined);
          toast.info("Subscription payment was cancelled.");
          console.log("Subscription order status updated successfully");
        } catch (error) {
          console.error("Failed to update subscription order status:", error);
          toast.error("Failed to update order status, but payment was cancelled.");
        }
      } else {
        console.log("Not processing cancellation - missing required parameters");
      }
    };

    processCancellation();
  }, [status, orderNumber, authority, planId]);

  const handleTryAgain = () => {
    navigate('/pricing');
  };

  const handleContinueShopping = () => {
    navigate('/pricing');
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl text-yellow-600">Payment Cancelled</CardTitle>
              <CardDescription>
                You have cancelled the payment process.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {orderNumber && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">Order Number:</span>
                    <div className="font-mono">{orderNumber}</div>
                    {authority && (
                      <>
                        <span className="font-medium mt-2 block">Transaction ID:</span>
                        <div className="font-mono">{authority}</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>What happened:</strong> The payment process was cancelled before completion. 
                  Your order is still saved and you can complete the payment anytime.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleTryAgain} className="bg-primary hover:bg-primary/90">
                  Complete Payment
                </Button>
                <Button onClick={handleContinueShopping} variant="outline">
                  Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCancelledPage;