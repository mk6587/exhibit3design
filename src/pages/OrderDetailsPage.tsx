import { useEffect, useState } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Package, Calendar, CreditCard, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Order {
  id: string;
  order_number: string;
  status: string;
  amount: number;
  created_at: string;
  product_id: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  customer_city: string;
  customer_postal_code: string;
  customer_country: string;
  payment_method: string;
  user_id: string | null;
}

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isGuestOrder = location.state?.isGuestOrder;
  const orderToken = location.state?.orderToken;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Order ID is required");
        setLoading(false);
        return;
      }

      try {
        let query = supabase.from("orders").select("*").eq("id", orderId);

        // For guest orders, verify the token
        if (isGuestOrder && orderToken) {
          query = query.eq("order_token", orderToken);
        }

        const { data: orderData, error: orderError } = await query.maybeSingle();

        if (orderError) {
          throw orderError;
        }

        if (!orderData) {
          setError("Order not found or access denied");
          return;
        }

        // For authenticated users, ensure they own the order
        if (!isGuestOrder && user && orderData.user_id !== user.id) {
          setError("You don't have permission to view this order");
          return;
        }

        setOrder(orderData);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, isGuestOrder, orderToken]);

  // Redirect non-authenticated users without proper guest access
  if (!user && !isGuestOrder) {
    return <Navigate to="/order-lookup" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading order details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertDescription>{error || "Order not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
                <CardDescription>
                  Order #{order.order_number || order.id.slice(0, 8)}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {order.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Information */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Order Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-semibold">${order.amount}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p>
                    {order.customer_first_name} {order.customer_last_name}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p>{order.customer_email}</p>
                </div>
                {order.customer_mobile && (
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p>{order.customer_mobile}</p>
                  </div>
                )}
                {order.customer_address && (
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p>
                      {order.customer_address}
                      {order.customer_city && `, ${order.customer_city}`}
                      {order.customer_postal_code && ` ${order.customer_postal_code}`}
                      {order.customer_country && `, ${order.customer_country}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </h3>
              <div className="text-sm">
                <div>
                  <span className="text-muted-foreground">Method:</span>
                  <p>{order.payment_method || "N/A"}</p>
                </div>
              </div>
            </div>

            {isGuestOrder && (
              <>
                <Separator />
                <Alert>
                  <AlertDescription>
                    This is a guest order. Keep your order token safe for future reference.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetailsPage;