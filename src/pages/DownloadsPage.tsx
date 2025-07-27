import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  product_id: number;
  amount: number;
  status: string;
  created_at: string;
  transaction_id?: string;
  payment_method?: string;
  products: {
    title: string;
    images: string[];
  };
}

const DownloadsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSuccessfulOrders();
  }, [user, navigate]);

  const fetchSuccessfulOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          product_id,
          amount,
          status,
          created_at,
          transaction_id,
          payment_method,
          products (
            title,
            images
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryStatus = (orderDate: string) => {
    const orderTime = new Date(orderDate).getTime();
    const currentTime = Date.now();
    const hoursPassed = (currentTime - orderTime) / (1000 * 60 * 60);
    
    if (hoursPassed >= 1) {
      return { status: 'delivered', message: 'Design files have been sent to your email' };
    } else {
      const remainingMinutes = Math.ceil((1 - hoursPassed) * 60);
      return { 
        status: 'pending', 
        message: `Design files will be sent within ${remainingMinutes} minutes` 
      };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your purchases...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Purchases</h1>
          
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't made any successful purchases yet.
                </p>
                <Button onClick={() => navigate('/products')}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const deliveryStatus = getDeliveryStatus(order.created_at);
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {order.products.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Purchased on {formatDate(order.created_at)}
                          </p>
                          {order.transaction_id && (
                            <p className="text-xs text-muted-foreground">
                              Transaction ID: {order.transaction_id}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            ${(order.amount / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-green-600 font-medium">
                            {order.status === 'completed' ? 'Paid' : order.status}
                          </p>
                          {order.payment_method && (
                            <p className="text-xs text-muted-foreground">
                              via {order.payment_method}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Clock className="w-4 h-4 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Delivery Status
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {deliveryStatus.message}
                            </p>
                          </div>
                          {deliveryStatus.status === 'delivered' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                          {deliveryStatus.status === 'pending' && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DownloadsPage;