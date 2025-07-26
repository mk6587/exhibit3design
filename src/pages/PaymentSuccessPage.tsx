import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Receipt } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';
import { toast } from 'sonner';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useProducts();
  
  const authority = searchParams.get('authority');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Clear the cart since payment was successful
    clearCart();
    
    // Show success message
    toast.success('Payment completed successfully!');
  }, [clearCart]);

  const handleViewPurchases = () => {
    navigate('/downloads');
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
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">
                Payment Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div>
                <p className="text-muted-foreground mb-4">
                  Thank you for your purchase! Your payment has been processed successfully.
                </p>
                {amount && (
                  <p className="text-lg font-semibold mb-2">
                    Amount Paid: ${(parseFloat(amount) / 100).toFixed(2)}
                  </p>
                )}
                {authority && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Transaction ID: {authority}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Design File Delivery</h3>
                </div>
                <p className="text-sm text-blue-800">
                  Your design files will be sent to your email address within <strong>1 hour</strong>. 
                  Please check your inbox (and spam folder) for the delivery confirmation.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleViewPurchases}
                  className="w-full"
                  size="lg"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  View Purchase History
                </Button>
                
                <Button 
                  onClick={handleContinueShopping}
                  variant="outline"
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

export default PaymentSuccessPage;