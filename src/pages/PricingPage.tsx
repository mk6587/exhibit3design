import { useEffect, useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_period: string;
  initial_ai_tokens: number;
  video_seconds: number;
  file_access_tier: string;
  max_files: number;
  features: any; // Will be parsed from JSONB
  is_featured: boolean;
  display_order: number;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

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

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `€${price.toFixed(2)}`;
  };

  const getPlanIcon = (name: string) => {
    if (name.includes('Free')) return Sparkles;
    if (name.includes('Pro')) return Zap;
    return Check;
  };

  return (
    <Layout
      title="Pricing Plans - Exhibit3Design"
      description="Choose the perfect plan for your exhibition stand design needs. Access professional templates and AI editing tools."
      keywords="pricing, subscription, exhibition stand templates, AI design tools"
    >
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
        {/* Header Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <Badge variant="outline" className="mb-4">
              Flexible Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access professional exhibition stand designs and AI editing tools. All plans include commercial license.
            </p>
          </div>
        </section>

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

                  return (
                    <Card
                      key={plan.id}
                      className={`relative flex flex-col ${
                        isFeatured 
                          ? 'border-primary border-2 shadow-xl scale-105' 
                          : 'border-border'
                      }`}
                    >
                      {isFeatured && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                          Best Value
                        </Badge>
                      )}

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
                          {plan.video_seconds > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">AI Video:</span>
                              <span className="font-semibold">{plan.video_seconds}s</span>
                            </div>
                          )}
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
                        <Button 
                          asChild
                          className="w-full" 
                          variant={isFeatured ? "default" : "outline"}
                          size="lg"
                        >
                          <Link to={plan.price === 0 ? "/auth" : `/subscription-checkout?planId=${plan.id}`}>
                            {plan.price === 0 ? 'Get Free Tokens' : 'Subscribe Now'}
                          </Link>
                        </Button>
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
            <h2 className="text-3xl font-bold mb-6">All Plans Include</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-card rounded-lg border">
                <Check className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Commercial License</h3>
                <p className="text-sm text-muted-foreground">
                  Use designs for client work and commercial projects
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <Sparkles className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">AI-Powered Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Instant customization with Runware Gemini & Kling
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <Zap className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">All File Formats</h3>
                <p className="text-sm text-muted-foreground">
                  Download in SKP, 3DS, PDF, and more formats
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Not Sure Which Plan to Choose?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start with our Free AI Trial and upgrade anytime. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/auth">Get 5 Free Tokens</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/ai-samples">See AI Examples</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
