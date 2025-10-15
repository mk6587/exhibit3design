import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Crown, Calendar, Zap, Video, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface SubscriptionData {
  subscription_id: string;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  file_access_tier: string;
  ai_tokens_included: number;
  video_results_included: number;
  status: string;
  current_period_end: string;
}

interface TokenBalance {
  ai_tokens: number;
  video_results: number;
  free_tokens_claimed: boolean;
  ai_tokens_limit: number;
  video_results_limit: number;
}

export function SubscriptionPanel() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get active subscription
      const { data: subData, error: subError } = await supabase
        .rpc('get_active_subscription', { p_user_id: user.id });

      if (subError) throw subError;
      
      if (subData && subData.length > 0) {
        setSubscription(subData[0]);
      }

      // Get token balance
      const { data: balanceData, error: balanceError } = await supabase
        .rpc('get_user_token_balance', { p_user_id: user.id });

      if (balanceError) throw balanceError;

      if (balanceData && balanceData.length > 0) {
        setTokenBalance(balanceData[0]);
      }

    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading subscription...</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-4">
        {/* Free Tokens Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Free Credits
            </CardTitle>
            <CardDescription>Start using AI features now!</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {tokenBalance && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <p className="text-sm font-medium">AI Image Edits</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">{tokenBalance.ai_tokens}/{tokenBalance.ai_tokens_limit} remaining</p>
                  <p className="text-xs text-muted-foreground mt-1">Free tokens</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="h-5 w-5 text-primary" />
                    <p className="text-sm font-medium">AI Video Results</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">{tokenBalance.video_results}/{tokenBalance.video_results_limit} remaining</p>
                  <p className="text-xs text-muted-foreground mt-1">Free tokens</p>
                </div>
              </div>
            )}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">Pro AI Pack Benefits:</p>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                    Recommended
                  </Badge>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">20 AI image edits per month</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Video className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">3 video results per month</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">3 design files</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Crown className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Best value for money</span>
                </div>
              </div>
              <Button asChild size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Link to="/pricing">
                  <Crown className="h-4 w-4 mr-2" />
                  Get Pro AI Pack
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Get more credits and unlock all premium features
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Upgrade Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Upgrade to Premium
            </CardTitle>
            <CardDescription>Get more tokens and exclusive features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span>More AI image edit tokens every month</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Video className="h-4 w-4 text-primary" />
                <span>Additional AI video result tokens</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span>Access to exclusive premium design files</span>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/pricing">View Subscription Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium': return 'bg-gradient-to-r from-yellow-500 to-amber-600';
      case 'standard': return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      case 'basic': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Subscription Card */}
      <Card className="border-2">
        <CardHeader className={`text-white ${getTierColor(subscription.file_access_tier)}`}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Crown className="h-5 w-5" />
                {subscription.plan_name}
              </CardTitle>
              <CardDescription className="text-white/90">
                Active subscription
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Access Tier</p>
                <p className="text-xs text-muted-foreground capitalize">{subscription.file_access_tier}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Renews</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Balance Card */}
      {tokenBalance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">AI Image Edits</p>
                </div>
                <p className="text-2xl font-bold">{tokenBalance.ai_tokens}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subscription.ai_tokens_included} included/month
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">AI Video Results</p>
                </div>
                <p className="text-2xl font-bold">{tokenBalance.video_results}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subscription.video_results_included} included/month
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/pricing">Upgrade Plan</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/ai-samples">Use Credits</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
