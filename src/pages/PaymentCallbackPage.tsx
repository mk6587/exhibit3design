import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '@/services/paymentService';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PaymentCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  
  const authority = searchParams.get('authority');
  const status = searchParams.get('status');

  useEffect(() => {
    const handleCallback = async () => {
      if (!authority) {
        toast.error('Invalid payment reference');
        navigate('/payment/failed?reason=Invalid payment reference');
        return;
      }

      try {
        if (status === 'success') {
          // Verify payment with YekPay
          const verification = await verifyPayment(authority);
          
          if (verification.success) {
            // Update orders status to completed
            const { error } = await supabase
              .from('orders')
              .update({ status: 'completed' })
              .eq('transaction_id', authority);

            if (error) {
              console.error('Failed to update order status:', error);
            }

            // Redirect to success page
            navigate(`/payment/success?authority=${authority}&amount=${verification.transaction.amount}`);
          } else {
            navigate(`/payment/failed?authority=${authority}&reason=Payment verification failed`);
          }
        } else {
          // Payment was cancelled or failed
          navigate(`/payment/failed?authority=${authority}&reason=Payment was cancelled or failed`);
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        navigate(`/payment/failed?authority=${authority}&reason=Payment processing error`);
      } finally {
        setVerifying(false);
      }
    };

    handleCallback();
  }, [authority, status, navigate]);

  if (verifying) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
                <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your payment...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return null;
};

export default PaymentCallbackPage;