import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Search } from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  created_at: string;
  plan_name: string;
  plan_price: number;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
}

export function SubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      // Get subscriptions with plan data
      const { data: subsData, error: subsError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (name, price)
        `)
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name');

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Combine the data
      const combinedData: Subscription[] = (subsData || []).map(sub => {
        const profile = profileMap.get(sub.user_id);
        return {
          id: sub.id,
          user_id: sub.user_id,
          plan_id: sub.plan_id,
          status: sub.status,
          current_period_end: sub.current_period_end,
          created_at: sub.created_at,
          plan_name: (sub.subscription_plans as any)?.name || 'N/A',
          plan_price: (sub.subscription_plans as any)?.price || 0,
          user_email: profile?.email || '',
          user_first_name: profile?.first_name || '',
          user_last_name: profile?.last_name || '',
        };
      });

      setSubscriptions(combinedData);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const fullName = `${sub.user_first_name} ${sub.user_last_name}`.toLowerCase();
    const email = sub.user_email.toLowerCase();
    const planName = sub.plan_name.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || planName.includes(search) || email.includes(search);
  });

  const getStatusBadge = (status: string, endDate: string) => {
    const isExpired = new Date(endDate) < new Date();
    if (isExpired && status === 'active') {
      return <Badge variant="destructive">Expired</Badge>;
    }
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      active: "default",
      cancelled: "outline",
      inactive: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscriptions Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Subscriptions Management
        </CardTitle>
        <CardDescription>View and manage all user subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period End</TableHead>
              <TableHead>Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchTerm ? 'No subscriptions found' : 'No subscriptions yet'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sub.user_email || 'N/A'}</div>
                      {sub.user_first_name && sub.user_last_name && (
                        <div className="text-sm text-muted-foreground">
                          {sub.user_first_name} {sub.user_last_name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {sub.plan_name}
                  </TableCell>
                  <TableCell>€{Number(sub.plan_price).toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(sub.status, sub.current_period_end)}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(sub.current_period_end), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(sub.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
