import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, ShoppingBag, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalRevenue: number;
  activeSubscriptions: number;
  totalOrders: number;
  totalUsers: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalOrders: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total revenue from completed orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('amount, status');
      
      if (ordersError) throw ordersError;

      const totalRevenue = orders
        ?.filter(o => o.status === 'completed')
        ?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;

      const totalOrders = orders?.filter(o => o.status === 'completed')?.length || 0;

      // Get active subscriptions count
      const { count: activeSubsCount, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString());

      if (subsError) throw subsError;

      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      setStats({
        totalRevenue,
        activeSubscriptions: activeSubsCount || 0,
        totalOrders,
        totalUsers: usersCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `€${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "From completed orders",
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: Crown,
      description: "Current subscribers",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      description: "Completed purchases",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered accounts",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
