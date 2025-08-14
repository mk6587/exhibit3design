import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

const OrderLookupPage = () => {
  const [email, setEmail] = useState("");
  const [orderToken, setOrderToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use the secure function to look up guest orders by token
      const { data: orders, error: orderError } = await supabase
        .rpc("get_guest_order_by_token", { order_token_param: orderToken });

      if (orderError) {
        throw orderError;
      }

      if (!orders || orders.length === 0) {
        setError("Order not found. Please check your order token and try again.");
        return;
      }

      const order = orders[0];

      // Note: For additional security, we could verify the email matches
      // but since customer data is encrypted, we'll rely on the token validation
      toast.success("Order found! Redirecting to order details...");
      navigate(`/order/${order.id}`, { 
        state: { 
          orderToken, 
          isGuestOrder: true,
          orderData: order // Pass the order data to avoid another lookup
        } 
      });

    } catch (err) {
      console.error("Order lookup error:", err);
      setError("Failed to look up order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Search className="h-5 w-5" />
              Order Lookup
            </CardTitle>
            <CardDescription>
              Enter your email and order token to view your order details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderToken">Order Token</Label>
                <Input
                  id="orderToken"
                  type="text"
                  value={orderToken}
                  onChange={(e) => setOrderToken(e.target.value)}
                  placeholder="Enter your order token"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  You can find your order token in your order confirmation email
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Looking up order...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find My Order
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have your order token?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/contact")}>
                  Contact Support
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderLookupPage;