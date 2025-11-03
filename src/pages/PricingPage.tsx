import { useEffect, useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { trackPageView, trackButtonClick } from "@/services/ga4Analytics";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_period: string;
  initial_ai_tokens: number;
  video_results: number;
  file_access_tier: string;
  max_files: number;
  features: any; // Will be parsed from JSONB
  is_featured: boolean;
  display_order: number;
}

interface CurrentSubscription {
  subscription_id: string;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  file_access_tier: string;
  ai_tokens_included: number;
  video_results_included: number;
  max_files: number;
  status: string;
  current_period_end: string;
}

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);

  useEffect(() => {
    trackPageView('/pricing', 'Pricing Plans - AI Exhibition Design');
    fetchPlans();
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Parse features from JSONB
      const parsedPlans = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) 
          ? plan.features 
          : typeof plan.features === 'string'
          ? JSON.parse(plan.features)
          : []
      }));
      
      setPlans(parsedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('get_active_subscription', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setCurrentPlanId(data[0].plan_id);
        setCurrentSubscription(data[0]);
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    }
  };

  const getCurrentPlan = () => {
    return plans.find(p => p.id === currentPlanId);
  };

  const isUpgrade = (plan: SubscriptionPlan) => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return true;
    return plan.display_order > currentPlan.display_order;
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `€${price.toFixed(2)}`;
  };

  const getPlanIcon = (name: string) => {
    if (name.includes('Free')) return Sparkles;
    if (name.includes('Pro')) return Zap;
    return Check;
  };

  const handleGetFreeTokens = (e: React.MouseEvent) => {
    e.preventDefault();
    trackButtonClick('get_free_tokens', 'pricing_page', { user_logged_in: !!user });
    window.location.href = 'https://ai.exhibit3design.com';
  };

  return (
    <Layout
      title="Exhibition Design Pricing | AI Booth Design Plans & 3D Downloads | Exhibit3Design"
      description="Professional exhibition stand design plans with AI tools. Access 3D booth files (SKP, 3DS), AI-powered 360° videos, instant photorealistic renders, Magic Edit customization, and commercial licensing. Plans from free trial to agency-level access. Try AI tools free before subscribing."
      keywords="AI design pricing, exhibition AI tools subscription, AI rendering plans, 360 video AI pricing, exhibition design subscription, booth design plans, AI booth pricing, trade show design subscription, 3D booth download pricing, exhibition AI subscription, photorealistic rendering plans, booth customization pricing, AI exhibition membership, design file subscription, exhibition design cost, AI booth tools pricing, trade show AI plans"
      url="https://exhibit3design.com/pricing"
    >
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
        {/* Header Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <Badge variant="outline" className="mb-4">
              Flexible Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Exhibition Design Pricing Plans: AI Tools + 3D Files
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From free trial to professional plans. Access ready-made 3D booth designs (SKP, 3DS formats) and AI-powered transformation tools: 360° videos, photorealistic renders, Magic Edit customization.
            </p>
          </div>
        </section>

        {/* Current Subscription Banner */}
        {currentSubscription && (
          <section className="px-4 pb-8">
            <div className="container mx-auto max-w-4xl">
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Check className="h-6 w-6 text-primary" />
                        Your Current Plan
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        Active subscription details
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-base px-4 py-1">
                      {currentSubscription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">{currentSubscription.plan_name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">€{currentSubscription.plan_price}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Access Tier:</span>
                          <span className="font-medium capitalize">{currentSubscription.file_access_tier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Renewal Date:</span>
                          <span className="font-medium">
                            {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Plan Benefits</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Design Files:</span>
                          <span className="font-medium">{currentSubscription.max_files}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AI Image Edits:</span>
                          <span className="font-medium">{currentSubscription.ai_tokens_included}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AI Videos:</span>
                          <span className="font-medium">{currentSubscription.video_results_included}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Pricing Cards */}
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-7xl">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading plans...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => {
                  const Icon = getPlanIcon(plan.name);
                  const isFeatured = plan.is_featured;
                  const isCurrentPlan = currentPlanId === plan.id;

                  return (
                    <Card
                      key={plan.id}
                      className={`relative flex flex-col ${
                        isCurrentPlan
                          ? 'border-primary border-2 shadow-xl'
                          : isFeatured 
                          ? 'border-primary border-2 shadow-xl scale-105' 
                          : 'border-border'
                      }`}
                    >
                      {isCurrentPlan ? (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                          Current Plan
                        </Badge>
                      ) : isFeatured ? (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                          Best Value
                        </Badge>
                      ) : null}

                      <CardHeader className="text-center pb-4">
                        <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                          isFeatured ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <Icon className={`h-6 w-6 ${isFeatured ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription className="text-sm mt-2">
                          {plan.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-grow">
                        {/* Price */}
                        <div className="text-center mb-6">
                          <div className="text-4xl font-bold mb-1">
                            {formatPrice(plan.price)}
                          </div>
                          {plan.price > 0 && (
                            <p className="text-sm text-muted-foreground">
                              per {plan.billing_period === 'monthly' ? 'month' : 'one-time'}
                            </p>
                          )}
                        </div>

                        {/* Key Stats */}
                        <div className="space-y-2 mb-6 p-4 bg-muted/50 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Design Files:</span>
                            <span className="font-semibold">{plan.max_files}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">AI Image Edits:</span>
                            <span className="font-semibold">{plan.initial_ai_tokens}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">AI Videos:</span>
                            <span className="font-semibold">{plan.video_results}</span>
                          </div>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter className="pt-4">
                        {isCurrentPlan ? (
                          <Button 
                            className="w-full" 
                            variant="secondary"
                            size="lg"
                            disabled
                          >
                            Current Plan
                          </Button>
                        ) : plan.price === 0 ? (
                          <Button 
                            className="w-full" 
                            variant={isFeatured ? "default" : "outline"}
                            size="lg"
                            onClick={handleGetFreeTokens}
                          >
                            {user ? 'Try AI Studio' : 'Get Free Tokens'}
                          </Button>
                        ) : (
                          <Button 
                            asChild
                            className="w-full" 
                            variant={isFeatured ? "default" : "outline"}
                            size="lg"
                            disabled={currentPlanId && !isUpgrade(plan)}
                            onClick={() => trackButtonClick(
                              'subscribe_now',
                              'pricing_page',
                              { plan_name: plan.name, plan_price: plan.price }
                            )}
                          >
                            <Link to={`/subscription-checkout?planId=${plan.id}`}>
                              {!user ? 'Subscribe Now' : 
                               currentPlanId ? (isUpgrade(plan) ? 'Upgrade Plan' : 'Lower Tier') : 
                               'Subscribe Now'}
                            </Link>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FAQ or Additional Info */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">All Exhibition Design Plans Include</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-card rounded-lg border">
                <Check className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Commercial License for Trade Shows</h3>
                <p className="text-sm text-muted-foreground">
                  Use booth designs for client work and commercial exhibition projects
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <Sparkles className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">AI-Powered Booth Customization</h3>
                <p className="text-sm text-muted-foreground">
                  Instant stand customization with AI: 360° videos, renders, Magic Edit
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <Zap className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Multiple 3D File Formats</h3>
                <p className="text-sm text-muted-foreground">
                  Download exhibition designs in SKP, 3DS, PDF formats for any software
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Only show if user doesn't have a subscription */}
        {!currentPlanId && (
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold mb-4">
                Start with Free AI Exhibition Design Trial
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Try our AI booth design tools before subscribing. Get 2 free AI tokens to test 360° videos, photorealistic renders, and Magic Edit. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleGetFreeTokens}>
                  {user ? 'Try AI Studio' : 'Get Free Exhibition AI Tokens'}
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/ai-samples">See AI Examples</Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
