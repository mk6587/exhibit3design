import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ShoppingCart, History } from 'lucide-react';
import { toast } from 'sonner';

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const authority = searchParams.get('authority');
  const reason = searchParams.get('reason') || 'Payment was cancelled or failed';

  useEffect(() => {
    toast.error('Payment was not completed');
  }, []);

  const handleTryAgain = () => {
    navigate('/cart');
  };

  const handleViewOrders = () => {
    navigate('/profile?tab=orders');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-700">
                Payment Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div>
                <p className="text-muted-foreground mb-2">
                  Unfortunately, your payment could not be processed.
                </p>
                <p className="text-sm text-muted-foreground">
                  Reason: {reason}
                </p>
                {authority && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Reference: {authority}
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleTryAgain}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Try Payment Again
                </Button>
                
                <Button 
                  onClick={handleViewOrders}
                  variant="outline"
                  className="w-full"
                >
                  <History className="w-4 h-4 mr-2" />
                  View Order History
                </Button>
                
                <Button 
                  onClick={handleContinueShopping}
                  variant="ghost"
                  className="w-full"
                >
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