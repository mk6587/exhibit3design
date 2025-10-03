import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { OTPInput } from "@/components/ui/otp-input";
import { TurnstileCaptcha, TurnstileCaptchaRef } from "@/components/ui/turnstile-captcha";
import { toast } from "sonner";
import { initiatePayment } from "@/services/paymentService";
import { useAuth } from "@/contexts/AuthContext";
import { useOTPAuth } from "@/contexts/OTPAuthContext";
import { useProducts } from "@/contexts/ProductsContext";
import { supabase } from "@/integrations/supabase/client";
import { trackBeginCheckout, trackAddShippingInfo, trackAddPaymentInfo } from "@/services/ga4Analytics";
import PaymentRedirectModal from "@/components/checkout/PaymentRedirectModal";
import SEOHead from "@/components/SEO/SEOHead";
import { ArrowLeft } from "lucide-react";
import { checkoutFormSchema } from "@/lib/validationSchemas";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Turnstile site key
const TURNSTILE_SITE_KEY = '0x4AAAAAABrwTuOgXHn1AdM8';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const { sendOTP, verifyOTP, isLoading } = useOTPAuth();
  const { cartItems, cartTotal, clearCart } = useProducts();

  // Auth readiness and session state
  const [authReady, setAuthReady] = useState(false);
  const [sessionUser, setSessionUser] = useState<null | { email?: string }>(null);

  // Multi-step flow: 'info' | 'otp' | 'processing'
  const [step, setStep] = useState<'info' | 'otp' | 'processing'>('info');
  
  // Single source of truth for authenticated user
  const authedUser = user ?? sessionUser;
  const isGuest = !authedUser;

  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // OTP (guest only)
  const [otp, setOTP] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [otpError, setOTPError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const otpInputRef = useRef<React.ElementRef<typeof OTPInput>>(null);
  const captchaRef = useRef<TurnstileCaptchaRef>(null);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  // Focus OTP input when step changes to 'otp'
  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  useEffect(() => {
    if (step !== 'otp') return;
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, step]);

  // Auth readiness: check session on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        setSessionUser(data.session?.user ?? null);
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
      toast.error("Your cart is empty");
      return;
    }
    trackBeginCheckout(cartItems, cartTotal);
  }, [cartItems.length, navigate, cartItems, cartTotal]);

  // ------- HARD RESET: if authenticated, never allow OTP -------
  useEffect(() => {
    if (authedUser && step === 'otp') {
      setStep('info');
      setOTP('');
      setOTPError('');
      setTimeLeft(0);
    }
  }, [authedUser, step]);
  // -------------------------------------------------------------

  // Prefill from profile/session
  useEffect(() => {
    if (user && profile) {
      setCustomerInfo({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: user.email || "",
        mobile: profile.phone_number || "",
        address: profile.address_line_1 || "",
        city: profile.city || "",
        postalCode: profile.postcode || "",
        country: profile.country || "",
      });
    } else if (user) {
      setCustomerInfo(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user, profile]);

  useEffect(() => {
    if (customerInfo.address && customerInfo.city && customerInfo.country) {
      trackAddShippingInfo(cartItems, cartTotal, 'Digital');
    }
  }, [customerInfo.address, customerInfo.city, customerInfo.country, cartItems, cartTotal]);

  const validateForm = () => {
    try {
      checkoutFormSchema.parse(customerInfo);
      setValidationErrors({});
      return true;
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
      }
      setValidationErrors(errors);
      return false;
    }
  };

  const saveUserProfile = async () => {
    if (!user || !updateProfile || !profile) return;
    const hasChanges =
      customerInfo.firstName !== (profile.first_name || "") ||
      customerInfo.lastName !== (profile.last_name || "") ||
      customerInfo.mobile !== (profile.phone_number || "") ||
      customerInfo.address !== (profile.address_line_1 || "") ||
      customerInfo.city !== (profile.city || "") ||
      customerInfo.postalCode !== (profile.postcode || "") ||
      customerInfo.country !== (profile.country || "");
    if (!hasChanges) return;
    try {
      await updateProfile({
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone_number: customerInfo.mobile,
        address_line_1: customerInfo.address,
        city: customerInfo.city,
        postcode: customerInfo.postalCode,
        country: customerInfo.country
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const updateCustomerInfo = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) setValidationErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOTPError('');

    if (!authReady) {
      toast.error("Checking your login status… please try again in a second.");
      return;
    }
    if (!validateForm()) return;
    if (!policyAgreed) {
      toast.error("You must agree to our Privacy Policy to proceed with the payment");
      return;
    }

    trackAddShippingInfo(cartItems, cartTotal, 'Digital');

    // If user is logged in (either through auth context or session), skip OTP entirely
    if (user || sessionUser) {
      setStep('processing');
      trackAddPaymentInfo(cartItems, cartTotal, 'Card');
      try {
        await processPayment();
      } catch (err: any) {
        toast.error(err.message || 'Failed to initiate payment. Please try again.');
        setStep('info');
      }
      return;
    }

    // GUEST ONLY: Send OTP
    if (!captchaToken) {
      setOTPError('Please complete the security verification');
      return;
    }

    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await hashPassword(tempPassword);
    const result = await sendOTP(customerInfo.email, passwordHash, captchaToken);

    if (result.success) {
      setStep('otp');
      setTimeLeft(120);
      // Reset captcha after successful send
      captchaRef.current?.reset();
      setCaptchaToken('');
      toast.success('Verification code sent! Please check your email.');
    } else {
      // Reset captcha on error
      captchaRef.current?.reset();
      setCaptchaToken('');
      setOTPError(result.error || 'Failed to send verification code');
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGuest) return; // safety

    if (!otp || otp.length !== 4) {
      setOTPError('Please enter a 4-digit code');
      return;
    }

    // Prevent double submission
    if (step === 'processing') return;
    
    const result = await verifyOTP(customerInfo.email, otp);
    if (!result.success) {
      setOTPError(result.error || 'Invalid verification code');
      setOTP('');
      return;
    }

    // Optional magic link -> elevate to session
    if (result.magicLink) {
      try {
        // Parse the magic link URL to extract the parameters
        const url = new URL(result.magicLink);
        const token = url.searchParams.get('token');
        const type = url.searchParams.get('type');
        
        if (!token || !type) {
          console.error('Missing token or type in magic link:', { token: !!token, type: !!type });
          throw new Error('Invalid magic link format.');
        }
        
        // Use the magic link token to authenticate
        const { error } = await supabase.auth.verifyOtp({ 
          token_hash: token, 
          type: type as any 
        });
        
        if (error) {
          console.error('Magic link verification error:', error);
          throw error;
        }
        
        // Wait briefly for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err: any) {
        console.error('Authentication error:', err);
        toast.error('Authentication failed: ' + (err.message || 'Please try again.'));
        return;
      }
    }

    // Now set processing and track payment info only after successful OTP verification
    trackAddPaymentInfo(cartItems, cartTotal, 'Card');
    setStep('processing');

    try {
      await processPayment();
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Failed to initiate payment. Please try again.');
      setStep('otp');
    }
  };

  const processPayment = async () => {
    if (!isGuest) {
      await saveUserProfile();
    } else {
      // For guest users, store checkout data in temporary session
      try {
        const sessionToken = crypto.randomUUID();
        localStorage.setItem('guest_session_token', sessionToken);
        
        const { error: storeError } = await supabase.rpc('store_guest_checkout_session', {
          p_session_token: sessionToken,
          p_first_name: customerInfo.firstName,
          p_last_name: customerInfo.lastName,
          p_email: customerInfo.email,
          p_mobile: customerInfo.mobile,
          p_address: customerInfo.address,
          p_city: customerInfo.city,
          p_postal_code: customerInfo.postalCode,
          p_country: customerInfo.country
        });
        
        if (storeError) {
          console.error('Error storing guest session:', storeError);
        }
      } catch (error) {
        console.error('Error creating guest session:', error);
      }
    }

    const paymentData = {
      amount: cartTotal,
      description: `Purchase of ${cartItems.length} design(s) from Exhibit3Design`,
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        mobile: customerInfo.mobile,
        address: customerInfo.address,
        postalCode: customerInfo.postalCode,
        country: customerInfo.country,
        city: customerInfo.city,
      },
      orderItems: cartItems.map(item => ({
        id: item.id,
        name: item.title,
        price: item.price,
        quantity: item.quantity
      }))
    };

    const paymentResponse = await initiatePayment(paymentData);
    if (paymentResponse.success) {
      clearCart();
    } else {
      throw new Error('Payment initiation failed');
    }
  };

  const handleResendOTP = async () => {
    if (!isGuest || isResending) return;
    setIsResending(true);
    setOTPError('');

    if (!captchaToken) {
      setOTPError('Please complete the security verification to resend code');
      setIsResending(false);
      return;
    }

    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await hashPassword(tempPassword);

    const result = await sendOTP(customerInfo.email, passwordHash, captchaToken);
    if (result.success) {
      setTimeLeft(120);
      setOTP('');
      // Reset captcha after successful resend
      captchaRef.current?.reset();
      setCaptchaToken('');
      toast.success('Code resent! A new verification code has been sent to your email.');
    } else {
      // Reset captcha on error
      captchaRef.current?.reset();
      setCaptchaToken('');
      setOTPError(result.error || 'Failed to resend code');
    }
    setIsResending(false);
  };

  const handleBackToInfo = () => {
    setStep('info');
    setOTP('');
    setTimeLeft(0);
    setOTPError('');
    setCaptchaToken('');
    captchaRef.current?.reset();
  };

  if (cartItems.length === 0) return null;

  // QA Mode - show debug component if URL contains qa=true
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('qa') === 'true') {
    const { GuestCheckoutQA } = require('@/components/checkout/GuestCheckoutQA');
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <GuestCheckoutQA />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title="Secure Checkout - Exhibit3Design" 
        description="Complete your purchase with our secure, password-free checkout process." 
        url="https://exhibit3design.com/checkout" 
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Order Summary ... (unchanged) */}
        <div className="bg-secondary p-6 rounded-lg mb-8">
          <h2 className="font-semibold text-xl mb-4">Order Summary</h2>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between py-3 border-b last:border-0">
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <div className="font-medium">€{item.price}</div>
            </div>
          ))}
          <div className="pt-4 mt-4 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>€{cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader><CardTitle>Your Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {user && profile && (profile.first_name || profile.phone_number || profile.address_line_1) && (
              <div className="p-4 bg-muted rounded-lg mb-4">
                <p className="text-sm font-medium mb-2">Using your saved information:</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  {customerInfo.firstName && <p>Name: {customerInfo.firstName} {customerInfo.lastName}</p>}
                  {customerInfo.email && <p>Email: {customerInfo.email}</p>}
                  {customerInfo.mobile && <p>Phone: {customerInfo.mobile}</p>}
                  {customerInfo.address && <p>Address: {customerInfo.address}, {customerInfo.city}, {customerInfo.postalCode} {customerInfo.country}</p>}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  You can update this information in your <Link to="/profile" className="text-primary hover:underline">Profile Settings</Link>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" value={customerInfo.firstName}
                  onChange={e => updateCustomerInfo('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className={validationErrors.firstName ? "border-destructive" : ""} />
                {validationErrors.firstName && <p className="text-sm text-destructive mt-1">{validationErrors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" value={customerInfo.lastName}
                  onChange={e => updateCustomerInfo('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className={validationErrors.lastName ? "border-destructive" : ""} />
                {validationErrors.lastName && <p className="text-sm text-destructive mt-1">{validationErrors.lastName}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" value={customerInfo.email}
                  onChange={e => updateCustomerInfo('email', e.target.value)}
                  placeholder="Enter your email"
                  className={validationErrors.email ? "border-destructive" : ""}
                  readOnly={!isGuest} disabled={!isGuest} />
                {!isGuest && <p className="text-xs text-muted-foreground mt-1">Email cannot be changed (from your account)</p>}
                {validationErrors.email && <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>}
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input id="mobile" value={customerInfo.mobile}
                  onChange={e => updateCustomerInfo('mobile', e.target.value)}
                  placeholder="+44123456789"
                  className={validationErrors.mobile ? "border-destructive" : ""} />
                {validationErrors.mobile && <p className="text-sm text-destructive mt-1">{validationErrors.mobile}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input id="address" value={customerInfo.address}
                onChange={e => updateCustomerInfo('address', e.target.value)}
                placeholder="Enter your full address"
                className={validationErrors.address ? "border-destructive" : ""} />
              {validationErrors.address && <p className="text-sm text-destructive mt-1">{validationErrors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={customerInfo.city}
                  onChange={e => updateCustomerInfo('city', e.target.value)}
                  placeholder="City"
                  className={validationErrors.city ? "border-destructive" : ""} />
                {validationErrors.city && <p className="text-sm text-destructive mt-1">{validationErrors.city}</p>}
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input id="postalCode" value={customerInfo.postalCode}
                  onChange={e => updateCustomerInfo('postalCode', e.target.value)}
                  placeholder="Postal Code"
                  className={validationErrors.postalCode ? "border-destructive" : ""} />
                {validationErrors.postalCode && <p className="text-sm text-destructive mt-1">{validationErrors.postalCode}</p>}
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input id="country" value={customerInfo.country}
                  onChange={e => updateCustomerInfo('country', e.target.value)}
                  placeholder="US, UK, TR, etc."
                  className={validationErrors.country ? "border-destructive" : ""} />
                {validationErrors.country && <p className="text-sm text-destructive mt-1">{validationErrors.country}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="border rounded-lg p-6 mb-8">
          {step === 'info' && (
            <>
              <h2 className="font-semibold text-xl mb-4">Payment Information</h2>
              <p className="mb-6">
                You will be redirected to our secure payment gateway to complete your purchase.
                After successful payment, you will receive access to download your purchased designs.
              </p>

              {isGuest && (
                <div className="space-y-2 mb-6">
                  <Label>Security Verification</Label>
                  <TurnstileCaptcha
                    ref={captchaRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onVerify={setCaptchaToken}
                    onError={() => {
                      setCaptchaToken('');
                      setOTPError('Security verification failed. Please try again.');
                    }}
                    onExpire={() => {
                      setCaptchaToken('');
                      setOTPError('Security verification expired. Please verify again.');
                    }}
                    className="flex justify-center"
                  />
                </div>
              )}

              <div className="flex items-start justify-center space-x-4 mb-6 p-4 bg-muted/30 rounded-lg border">
                <Checkbox
                  id="privacy-policy"
                  checked={policyAgreed}
                  onCheckedChange={(checked) => setPolicyAgreed(checked as boolean)}
                  className="mt-0.5"
                />
                <label htmlFor="privacy-policy" className="text-sm leading-relaxed cursor-pointer font-medium">
                  I agree to the <Link to="/privacy-policy" className="text-primary hover:underline font-semibold" target="_blank">Privacy Policy</Link> and consent to the processing of my personal data for order fulfillment.
                </label>
              </div>

              {otpError && (
                <div className="text-sm text-destructive font-medium mb-4">
                  {otpError}
                </div>
              )}

              <Button
                onClick={handleInfoSubmit}
                disabled={!authReady || isLoading || (isGuest && !captchaToken)}
                className="w-full"
              >
                {!authReady
                  ? "Checking login status…"
                  : isLoading
                  ? "Processing..."
                  : isGuest
                  ? "Continue to Verification"
                  : "Complete Purchase"}
              </Button>
            </>
          )}

          {/* OTP SECTION: Only show for guests (completely hidden if user is authenticated) */}
          {(() => {
            const shouldShowOTP = authReady && step === 'otp' && !user && !sessionUser && !authedUser;
            return shouldShowOTP;
          })() && (
            <>
              <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="sm" onClick={handleBackToInfo}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h2 className="font-semibold text-xl">Email Verification</h2>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-4">
                  We've sent a 4-digit verification code to:
                </p>
                <p className="font-medium text-foreground mb-6">{customerInfo.email}</p>

                <div className="flex justify-center mb-4">
                  <OTPInput ref={otpInputRef} value={otp} onChange={setOTP} error={otpError} />
                </div>

                {timeLeft > 0 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Code expires in {formatTime(timeLeft)}
                  </p>
                )}
              </div>

              {!policyAgreed && (
                <div className="flex items-start space-x-4 mb-6 p-4 bg-muted/30 rounded-lg border">
                  <Checkbox
                    id="privacy-policy-otp"
                    checked={policyAgreed}
                    onCheckedChange={(checked) => setPolicyAgreed(checked as boolean)}
                    className="mt-0.5"
                  />
                  <label htmlFor="privacy-policy-otp" className="text-sm leading-relaxed cursor-pointer font-medium">
                    I agree to the <Link to="/privacy-policy" className="text-primary hover:underline font-semibold" target="_blank">Privacy Policy</Link> and consent to the processing of my personal data for order fulfillment.
                  </label>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleOTPSubmit}
                  disabled={isLoading || !otp || otp.length !== 4 || !policyAgreed}
                  className="w-full"
                >
                  {isLoading ? "Processing..." : "Complete Purchase"}
                </Button>

                {timeLeft === 0 && (
                  <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                      <Label>Security Verification for Resend</Label>
                      <TurnstileCaptcha
                        ref={captchaRef}
                        siteKey={TURNSTILE_SITE_KEY}
                        onVerify={setCaptchaToken}
                        onError={() => {
                          setCaptchaToken('');
                          setOTPError('Security verification failed. Please try again.');
                        }}
                        onExpire={() => {
                          setCaptchaToken('');
                          setOTPError('Security verification expired. Please verify again.');
                        }}
                        className="flex justify-center"
                      />
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={timeLeft > 0 || isResending || (timeLeft === 0 && !captchaToken)}
                  className="w-full"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </>
          )}

          {/* Processing state is now handled by button loading states */}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Your payment is secure and encrypted</p>
          </div>
        </div>
        </div>
      </div>

      <PaymentRedirectModal isOpen={step === 'processing'} />
    </Layout>
  );
};

export default CheckoutPage;
