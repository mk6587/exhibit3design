import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface SubscriptionOrder {
  id: string;
  order_number: string;
  status: string;
  amount: number;
  created_at: string;
  payment_method: string;
  plan_id: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
}

export const BillingHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [plans, setPlans] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBillingHistory();
    }
  }, [user]);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);

      // Fetch subscription orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("subscription_orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch subscription plans to get plan names
      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select("id, name");

      if (plansError) throw plansError;

      // Create a map of plan IDs to names
      const planMap: Record<string, string> = {};
      plansData?.forEach((plan: SubscriptionPlan) => {
        planMap[plan.id] = plan.name;
      });

      setOrders(ordersData || []);
      setPlans(planMap);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      toast({
        title: "Error",
        description: "Failed to load billing history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Successful
          </Badge>
        );
      case "cancelled":
      case "canceled":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRetryPayment = (order: SubscriptionOrder) => {
    // Navigate to checkout page with the plan ID
    navigate(`/subscription-checkout?planId=${order.plan_id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>View your payment history and retry failed payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>View your payment history and retry failed payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No payment history found</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/pricing")}
            >
              View Subscription Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing History
        </CardTitle>
        <CardDescription>View your payment history and retry failed payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.order_number || order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{plans[order.plan_id] || "Unknown Plan"}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell className="font-semibold">{formatAmount(order.amount)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    {(order.status.toLowerCase() === "cancelled" || 
                      order.status.toLowerCase() === "canceled" ||
                      order.status.toLowerCase() === "failed") && (
                      <Button
                        size="sm"
                        onClick={() => handleRetryPayment(order)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Pay Again
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
