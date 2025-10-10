import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, ShoppingBag, Crown, Sparkles, Video, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalRevenue: number;
  activeSubscriptions: number;
  totalOrders: number;
  totalUsers: number;
  monthlyRecurringRevenue: number;
  totalAiTokensUsed: number;
  totalVideoResultsUsed: number;
  averageTokensPerUser: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalOrders: 0,
    totalUsers: 0,
    monthlyRecurringRevenue: 0,
    totalAiTokensUsed: 0,
    totalVideoResultsUsed: 0,
    averageTokensPerUser: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total revenue from completed subscription orders
      const { data: subscriptionOrders, error: ordersError } = await supabase
        .from('subscription_orders')
        .select('amount, status');
      
      if (ordersError) throw ordersError;

      const totalRevenue = subscriptionOrders
        ?.filter(o => o.status === 'completed')
        ?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;

      const totalOrders = subscriptionOrders?.filter(o => o.status === 'completed')?.length || 0;

      // Get active subscriptions count
      const { count: activeSubsCount, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString());

      if (subsError) throw subsError;

      // Get total users count and token usage
      const { data: profiles, error: usersError } = await supabase
        .from('profiles')
        .select('ai_tokens_used, video_results_used');

      if (usersError) throw usersError;

      const totalAiTokensUsed = profiles?.reduce((sum, p) => sum + (p.ai_tokens_used || 0), 0) || 0;
      const totalVideoResultsUsed = profiles?.reduce((sum, p) => sum + (p.video_results_used || 0), 0) || 0;
      const usersCount = profiles?.length || 0;
      const averageTokensPerUser = usersCount > 0 ? Math.round(totalAiTokensUsed / usersCount) : 0;

      // Calculate Monthly Recurring Revenue (MRR) from active subscriptions
      const { data: activeSubscriptions, error: activeSubsError } = await supabase
        .from('user_subscriptions')
        .select('plan_id, subscription_plans(price)')
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString());

      if (activeSubsError) throw activeSubsError;

      const monthlyRecurringRevenue = activeSubscriptions?.reduce((sum, sub: any) => {
        return sum + Number(sub.subscription_plans?.price || 0);
      }, 0) || 0;

      setStats({
        totalRevenue,
        activeSubscriptions: activeSubsCount || 0,
        totalOrders,
        totalUsers: usersCount,
        monthlyRecurringRevenue,
        totalAiTokensUsed,
        totalVideoResultsUsed,
        averageTokensPerUser,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={`skeleton-${i}`}>
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
      </div>
    );
  }

  const revenueCards = [
    {
      title: "Total Revenue",
      value: `€${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "From completed orders",
    },
    {
      title: "Monthly Recurring Revenue",
      value: `€${stats.monthlyRecurringRevenue.toFixed(2)}`,
      icon: TrendingUp,
      description: "Active subscriptions MRR",
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
  ];

  const usageCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered accounts",
    },
    {
      title: "AI Tokens Used",
      value: stats.totalAiTokensUsed.toLocaleString(),
      icon: Sparkles,
      description: "Total AI generations",
    },
    {
      title: "Video Results Generated",
      value: stats.totalVideoResultsUsed.toLocaleString(),
      icon: Video,
      description: "Total video outputs",
    },
    {
      title: "Avg. Tokens per User",
      value: stats.averageTokensPerUser,
      icon: Sparkles,
      description: "AI usage average",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue & Subscriptions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Revenue & Subscriptions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {revenueCards.map((stat, index) => {
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
      </div>

      {/* Users & Token Usage */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Users & Token Usage</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {usageCards.map((stat, index) => {
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
      </div>
    </div>
  );
}
