import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  product_id: number;
  amount: number;
  status: string;
  created_at: string;
  products: {
    title: string;
    description: string;
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
          products (
            title,
            description,
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
      toast.error('Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (orderId: string, productTitle: string) => {
    try {
      // In a real app, this would generate a secure download link
      // For now, we'll simulate the download
      toast.success(`Downloading ${productTitle}...`);
      
      // Simulate download delay
      setTimeout(() => {
        toast.success('Download started successfully!');
      }, 1000);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to start download');
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
          <div className="text-center">Loading your downloads...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Downloads</h1>
          
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No downloads available</h3>
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
              {orders.map((order) => (
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
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ${(order.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          {order.status === 'completed' ? 'Paid' : order.status}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-4">
                          {order.products.description}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleDownload(order.id, order.products.title)}
                        className="ml-4"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DownloadsPage;