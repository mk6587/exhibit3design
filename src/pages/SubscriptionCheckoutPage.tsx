import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { initiateSubscriptionPayment } from "@/services/subscriptionPaymentService";
import { Loader2, CreditCard } from "lucide-react";
import { trackPageView, trackSubscriptionEvent, trackButtonClick } from "@/services/ga4Analytics";
import { PageSkeleton } from "@/components/ui/page-skeleton";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the privacy policy to continue",
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function SubscriptionCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const planId = searchParams.get('planId');

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      acceptTerms: false,
    },
  });

  useEffect(() => {
    if (!planId) {
      toast.error("No plan selected");
      navigate('/pricing');
      return;
    }

    loadData();
  }, [planId]);

  const loadData = async () => {
    try {
      // Check authentication
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast.error("Please sign in to subscribe");
        navigate('/auth?redirect=/subscription-checkout?planId=' + planId);
        return;
      }
      setUser(authUser);

      // Load plan details
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single();

      if (planError || !planData) {
        toast.error("Invalid subscription plan");
        navigate('/pricing');
        return;
      }
      setPlan(planData);
      
      // Track page view with plan details
      trackPageView(
        `/subscription-checkout?planId=${planId}`,
        `Checkout - ${planData.name} Subscription`
      );

      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (profile) {
        form.reset({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: authUser.email || "",
          mobile: profile.phone_number || "",
          address: profile.address_line_1 || "",
          city: profile.city || "",
          postalCode: profile.postcode || "",
          country: profile.country || "",
        });
      } else {
        form.setValue('email', authUser.email || "");
      }

    } catch (error) {
      console.error("Error loading checkout data:", error);
      toast.error("Failed to load checkout page");
      navigate('/pricing');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!plan) return;

    setProcessing(true);
    
    // Track subscription initiation
    trackSubscriptionEvent('subscribe', {
      plan_id: plan.id,
      plan_name: plan.name,
      plan_price: plan.price,
      billing_period: plan.billing_period,
      ai_tokens: plan.initial_ai_tokens,
      video_results: plan.video_results,
      max_files: plan.max_files,
      file_access_tier: plan.file_access_tier
    });
    
    try {
      await initiateSubscriptionPayment({
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        billingPeriod: plan.billing_period,
        customerInfo: data
      });
    } catch (error) {
      console.error("Payment error:", error);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <PageSkeleton />
      </Layout>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <Layout
      title={`Subscribe to ${plan.name} - AI Exhibition Design Platform | Exhibit3Design`}
      description={`Complete your ${plan.name} subscription for AI-powered exhibition stand design. Get ${plan.initial_ai_tokens} AI tokens, ${plan.max_files} design files, and instant photorealistic renders.`}
      keywords="AI subscription, exhibition design plans, AI rendering tokens, trade show design subscription, exhibition AI tools"
      url="https://exhibit3design.com/subscription-checkout"
    >
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Complete Your Subscription</h1>

        <div className="grid gap-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Plan: {plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold">€{plan.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Period:</span>
                  <span className="font-semibold capitalize">{plan.billing_period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Image Tokens:</span>
                  <span className="font-semibold">{plan.initial_ai_tokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Design Files:</span>
                  <span className="font-semibold">{plan.max_files}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Please provide your billing details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the{" "}
                            <Link
                              to="/privacy-policy"
                              target="_blank"
                              className="text-primary underline hover:text-primary/80"
                            >
                              Privacy Policy
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay €{plan.price} via Stripe
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
