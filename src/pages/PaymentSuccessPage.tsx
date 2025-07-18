import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download } from 'lucide-react';
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

  const handleGoToDownloads = () => {
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
                <p className="text-muted-foreground mb-2">
                  Thank you for your purchase. Your payment has been processed successfully.
                </p>
                {amount && (
                  <p className="text-lg font-semibold">
                    Amount Paid: ${(parseFloat(amount) / 100).toFixed(2)}
                  </p>
                )}
                {authority && (
                  <p className="text-sm text-muted-foreground">
                    Transaction ID: {authority}
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleGoToDownloads}
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Go to Downloads
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