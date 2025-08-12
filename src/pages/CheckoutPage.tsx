import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { OTPInput } from "@/components/ui/otp-input";
import { Separator } from "@/components/ui/separator";
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

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { sendOTP, verifyOTP, isLoading } = useOTPAuth();
  const { cartItems, cartTotal, clearCart } = useProducts();
  
  // Multi-step flow: 'info' | 'otp' | 'processing'
  const [step, setStep] = useState<'info' | 'otp' | 'processing'>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // OTP related state
  const [otp, setOTP] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [otpError, setOTPError] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Customer Information
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

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Timer for OTP expiration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && step === 'otp') {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, step]);

  useEffect(() => {
    // Check cart first
    if (cartItems.length === 0) {
      navigate("/cart");
      toast.error("Your cart is empty");
      return;
    }

    // Track begin_checkout when checkout page loads
    trackBeginCheckout(cartItems, cartTotal);
    
    // If user is logged in, skip to OTP step
    if (user) {
      setStep('otp');
    }
  }, [cartItems.length, navigate, user, cartItems, cartTotal]);

  // Initialize customer info with user data if logged in
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
      setCustomerInfo(prev => ({
        ...prev,
        email: user.email || ""
      }));
    }
  }, [user, profile]);

  // Track shipping info when customer info is filled
  useEffect(() => {
    if (customerInfo.address && customerInfo.city && customerInfo.country) {
      trackAddShippingInfo(cartItems, cartTotal, 'Digital');
    }
  }, [customerInfo.address, customerInfo.city, customerInfo.country, cartItems, cartTotal]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!customerInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!customerInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!customerInfo.email.trim()) errors.email = "Email address is required";
    if (!customerInfo.mobile.trim()) errors.mobile = "Mobile number is required";
    if (!customerInfo.address.trim()) errors.address = "Address is required";
    if (!customerInfo.city.trim()) errors.city = "City is required";
    if (!customerInfo.postalCode.trim()) errors.postalCode = "Postal code is required";
    if (!customerInfo.country.trim()) errors.country = "Country is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerInfo.email && !emailRegex.test(customerInfo.email)) {
      errors.email = "Please enter a valid email address";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveUserProfile = async () => {
    if (!user || !updateProfile || !profile) return;
    
    // Check if any profile data has actually changed
    const hasChanges = 
      customerInfo.firstName !== (profile.first_name || "") ||
      customerInfo.lastName !== (profile.last_name || "") ||
      customerInfo.mobile !== (profile.phone_number || "") ||
      customerInfo.address !== (profile.address_line_1 || "") ||
      customerInfo.city !== (profile.city || "") ||
      customerInfo.postalCode !== (profile.postcode || "") ||
      customerInfo.country !== (profile.country || "");
    
    // Only update if there are actual changes
    if (!hasChanges) {
      console.log("No profile changes detected, skipping update");
      return;
    }
    
    try {
      console.log("Updating profile with new information");
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

  // Simple password hashing for temporary passwords
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateCustomerInfo = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOTPError('');
    
    if (!validateForm()) return;
    if (!policyAgreed) {
      toast.error("You must agree to our Privacy Policy to proceed with the payment");
      return;
    }

    // Track shipping info added
    trackAddShippingInfo(cartItems, cartTotal, 'Digital');

    // Generate temporary password hash for new user registration
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await hashPassword(tempPassword);
    
    const result = await sendOTP(customerInfo.email, passwordHash);
    if (result.success) {
      setStep('otp');
      setTimeLeft(120); // 2 minutes
      toast.success('Verification code sent! Please check your email for the verification code to complete your order.');
    } else {
      setOTPError(result.error || 'Failed to send verification code');
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOTPError('');
    
    if (!otp || otp.length !== 4) {
      setOTPError('Please enter a 4-digit code');
      return;
    }

    // Track payment info added
    trackAddPaymentInfo(cartItems, cartTotal, 'Card');
    setStep('processing');
    
    const result = await verifyOTP(customerInfo.email, otp);
    if (result.success) {
      // If there's a magic link, navigate to it directly to complete authentication
      if (result.magicLink) {
        // Extract the token from the magic link URL
        const url = new URL(result.magicLink);
        const token = url.searchParams.get('token');
        const type = url.searchParams.get('type');
        
        if (token && type === 'magiclink') {
          try {
            // Use verifyOtp to establish the session
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'magiclink'
            });
            
            if (error) {
              console.error('Auth verification error:', error);
              throw new Error('Failed to authenticate');
            }
            
            console.log('Authentication successful:', data);

            // Wait a moment for auth state to update, then proceed with payment
            setTimeout(async () => {
              try {
                await processPayment();
              } catch (paymentError: any) {
                console.error('Payment error:', paymentError);
                toast.error(paymentError.message || 'Failed to initiate payment. Please try again.');
                setStep('otp');
              }
            }, 1000);
            return;
          } catch (authError: any) {
            console.error('Authentication failed:', authError);
            toast.error('Failed to authenticate. Please try again.');
            setStep('otp');
            return;
          }
        }
      }

      // If no magic link or direct auth, proceed with payment
      try {
        await processPayment();
      } catch (error: any) {
        console.error('Payment error:', error);
        toast.error(error.message || 'Failed to initiate payment. Please try again.');
        setStep('otp');
      }
    } else {
      setOTPError(result.error || 'Invalid verification code');
      setStep('otp');
      setOTP('');
    }
  };

  const processPayment = async () => {
    // Save user profile information before payment (for logged-in users)
    if (user) {
      await saveUserProfile();
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
    if (isResending) return;
    setIsResending(true);
    setOTPError('');
    
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await hashPassword(tempPassword);
    
    const result = await sendOTP(customerInfo.email, passwordHash);
    if (result.success) {
      setTimeLeft(120);
      setOTP('');
      toast.success('Code resent! A new verification code has been sent to your email.');
    } else {
      setOTPError(result.error || 'Failed to resend code');
    }
    setIsResending(false);
  };

  const handleBackToInfo = () => {
    setStep('info');
    setOTP('');
    setTimeLeft(0);
    setOTPError('');
  };

  if (cartItems.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <SEOHead 
        title="Secure Checkout - Exhibit3Design" 
        description="Complete your purchase with our secure, password-free checkout process." 
        url="https://exhibit3design.com/checkout" 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
            <p className="text-muted-foreground">
              {step === 'info' && 'Complete your order information'}
              {step === 'otp' && 'Verify your email to complete the purchase'}
              {step === 'processing' && 'Processing your order...'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Order Summary */}
            <Card className="border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Digital design files
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">€{item.price}</p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>€{cartTotal}</span>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Form */}
            <Card className="border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
              <CardHeader>
                <CardTitle>
                  {step === 'info' && 'Contact & Shipping Information'}
                  {step === 'otp' && 'Email Verification'}
                  {step === 'processing' && 'Processing Order'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* STEP 1: Customer Info (for guests) */}
                {step === 'info' && (
                  <form onSubmit={handleInfoSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input 
                          id="firstName" 
                          value={customerInfo.firstName} 
                          onChange={e => updateCustomerInfo('firstName', e.target.value)} 
                          className={validationErrors.firstName ? 'border-destructive' : ''} 
                        />
                        {validationErrors.firstName && <p className="text-sm text-destructive">{validationErrors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName" 
                          value={customerInfo.lastName} 
                          onChange={e => updateCustomerInfo('lastName', e.target.value)} 
                          className={validationErrors.lastName ? 'border-destructive' : ''} 
                        />
                        {validationErrors.lastName && <p className="text-sm text-destructive">{validationErrors.lastName}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={customerInfo.email} 
                        onChange={e => updateCustomerInfo('email', e.target.value)} 
                        className={validationErrors.email ? 'border-destructive' : ''} 
                      />
                      {validationErrors.email && <p className="text-sm text-destructive">{validationErrors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile">Phone Number *</Label>
                      <Input 
                        id="mobile" 
                        type="tel" 
                        value={customerInfo.mobile} 
                        onChange={e => updateCustomerInfo('mobile', e.target.value)} 
                        className={validationErrors.mobile ? 'border-destructive' : ''} 
                      />
                      {validationErrors.mobile && <p className="text-sm text-destructive">{validationErrors.mobile}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input 
                        id="address" 
                        value={customerInfo.address} 
                        onChange={e => updateCustomerInfo('address', e.target.value)} 
                        className={validationErrors.address ? 'border-destructive' : ''} 
                      />
                      {validationErrors.address && <p className="text-sm text-destructive">{validationErrors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input 
                          id="city" 
                          value={customerInfo.city} 
                          onChange={e => updateCustomerInfo('city', e.target.value)} 
                          className={validationErrors.city ? 'border-destructive' : ''} 
                        />
                        {validationErrors.city && <p className="text-sm text-destructive">{validationErrors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input 
                          id="postalCode" 
                          value={customerInfo.postalCode} 
                          onChange={e => updateCustomerInfo('postalCode', e.target.value)} 
                          className={validationErrors.postalCode ? 'border-destructive' : ''} 
                        />
                        {validationErrors.postalCode && <p className="text-sm text-destructive">{validationErrors.postalCode}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input 
                        id="country" 
                        value={customerInfo.country} 
                        onChange={e => updateCustomerInfo('country', e.target.value)} 
                        className={validationErrors.country ? 'border-destructive' : ''} 
                      />
                      {validationErrors.country && <p className="text-sm text-destructive">{validationErrors.country}</p>}
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg border">
                      <Checkbox 
                        id="privacy-policy" 
                        checked={policyAgreed} 
                        onCheckedChange={(checked) => setPolicyAgreed(checked as boolean)} 
                        className="mt-0.5"
                      />
                      <label htmlFor="privacy-policy" className="text-sm leading-relaxed cursor-pointer">
                        I agree to the <Link to="/privacy-policy" className="text-primary hover:underline font-semibold" target="_blank">Privacy Policy</Link> and consent to the processing of my personal data for order fulfillment.
                      </label>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? "Sending code..." : "Continue to Verification"}
                    </Button>
                  </form>
                )}

                {/* STEP 2: OTP Verification */}
                {step === 'otp' && (
                  <form onSubmit={handleOTPSubmit} className="space-y-6">
                    {/* Show customer info for logged-in users */}
                    {user && profile && (profile.first_name || profile.phone_number || profile.address_line_1) && (
                      <div className="p-4 bg-muted/30 rounded-lg mb-6">
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

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        We've sent a 4-digit verification code to:
                      </p>
                      <p className="font-medium text-foreground mb-6">{customerInfo.email}</p>
                      
                      <div className="flex justify-center mb-4">
                        <OTPInput
                          value={otp}
                          onChange={setOTP}
                          error={otpError}
                        />
                      </div>
                      
                      {otpError && <p className="text-sm text-destructive mb-4">{otpError}</p>}
                      
                      {timeLeft > 0 && (
                        <p className="text-sm text-muted-foreground mb-4">
                          Code expires in {formatTime(timeLeft)}
                        </p>
                      )}
                    </div>

                    {!policyAgreed && (
                      <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg border">
                        <Checkbox 
                          id="privacy-policy-otp" 
                          checked={policyAgreed} 
                          onCheckedChange={(checked) => setPolicyAgreed(checked as boolean)} 
                          className="mt-0.5"
                        />
                        <label htmlFor="privacy-policy-otp" className="text-sm leading-relaxed cursor-pointer">
                          I agree to the <Link to="/privacy-policy" className="text-primary hover:underline font-semibold" target="_blank">Privacy Policy</Link> and consent to the processing of my personal data for order fulfillment.
                        </label>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Button 
                        type="submit" 
                        disabled={isLoading || !otp || otp.length !== 4 || !policyAgreed} 
                        className="w-full"
                      >
                        {isLoading ? "Verifying..." : "Complete Purchase"}
                      </Button>
                      
                      <div className="flex gap-3">
                        {!user && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleBackToInfo}
                            className="flex-1"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                          </Button>
                        )}
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleResendOTP}
                          disabled={timeLeft > 0 || isResending}
                          className="flex-1"
                        >
                          {isResending ? "Sending..." : "Resend Code"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {/* STEP 3: Processing */}
                {step === 'processing' && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Processing your order...</h3>
                    <p className="text-muted-foreground">Please wait while we redirect you to the payment gateway.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <PaymentRedirectModal 
        isOpen={step === 'processing'}
      />
    </Layout>
  );
};
export default CheckoutPage;