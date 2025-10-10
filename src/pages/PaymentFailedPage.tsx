import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { updateSubscriptionOrderStatus } from "@/services/subscriptionPaymentService";

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const status = searchParams.get('status');
  const orderNumber = searchParams.get('order_number');
  const authority = searchParams.get('authority');
  const error = searchParams.get('error');
  const planId = searchParams.get('planId');

  useEffect(() => {
    const processFailure = async () => {
      if (status === 'failed' && orderNumber && planId) {
        try {
          await updateSubscriptionOrderStatus(orderNumber, 'failed', authority || undefined);
          toast.error("Subscription payment failed. Please try again.");
        } catch (updateError) {
          console.error("Failed to update subscription order status:", updateError);
        }
      }
    };

    processFailure();
  }, [status, orderNumber, authority, planId]);

  const handleTryAgain = () => {
    navigate('/pricing');
  };

  const handleViewOrders = () => {
    navigate('/profile');
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
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
              <CardDescription>
                Unfortunately, your payment could not be processed.
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

              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Error Details:</strong> {decodeURIComponent(error)}
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>What to do next:</strong> You can try the payment again or contact our support team if the issue persists.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleTryAgain} className="bg-primary hover:bg-primary/90">
                  Try Again
                </Button>
                <Button onClick={handleViewOrders} variant="outline">
                  View Order History
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

export default PaymentFailedPage;