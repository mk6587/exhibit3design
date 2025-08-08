import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OTPInput } from "@/components/ui/otp-input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOTPAuth } from "@/contexts/OTPAuthContext";
import { useProducts } from "@/contexts/ProductsContext";
import { initiatePayment } from "@/services/paymentService";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEO/SEOHead";
import { trackBeginCheckout, trackAddPaymentInfo, trackAddShippingInfo } from "@/services/ga4Analytics";
import { Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}
const OTPCheckoutPage = () => {
  const [step, setStep] = useState<'info' | 'otp' | 'processing'>('info');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [otp, setOTP] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});
  const [otpError, setOTPError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    sendOTP,
    verifyOTP,
    isLoading
  } = useOTPAuth();
  const {
    cartItems,
    clearCart,
    cartTotal
  } = useProducts();
  const navigate = useNavigate();

  // Timer for OTP expiration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && step === 'otp') {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, step]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Track begin checkout
    trackBeginCheckout(cartItems, cartTotal);
  }, [cartItems, navigate, cartTotal]);

  // Populate user data if logged in
  useEffect(() => {
    if (user?.user_metadata) {
      setCustomerInfo(prev => ({
        ...prev,
        firstName: user.user_metadata.first_name || '',
        lastName: user.user_metadata.last_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);
  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};
    if (!customerInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!customerInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!customerInfo.email.trim()) newErrors.email = 'Email is required';else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!customerInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!customerInfo.address.trim()) newErrors.address = 'Address is required';
    if (!customerInfo.city.trim()) newErrors.city = 'City is required';
    if (!customerInfo.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!customerInfo.country.trim()) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOTPError('');
    if (!validateForm()) return;
    if (!policyAgreed) {
      toast({
        title: 'Privacy Policy Agreement Required',
        description: 'Please agree to the privacy policy to continue.',
        variant: 'destructive'
      });
      return;
    }

    // Track shipping info added
    trackAddShippingInfo(cartItems, cartTotal);

    // Generate temporary password hash for new user registration
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await hashPassword(tempPassword);
    const result = await sendOTP(customerInfo.email, passwordHash);
    if (result.success) {
      setStep('otp');
      setTimeLeft(120); // 2 minutes
      toast({
        title: 'Verification code sent!',
        description: 'Please check your email for the verification code to complete your order.'
      });
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
    trackAddPaymentInfo(cartItems, cartTotal);
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
            const {
              data,
              error
            } = await supabase.auth.verifyOtp({
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
                const paymentData = {
                  amount: cartTotal,
                  description: `Order for ${cartItems.length} digital design files`,
                  customerInfo: {
                    firstName: customerInfo.firstName,
                    lastName: customerInfo.lastName,
                    email: customerInfo.email,
                    mobile: customerInfo.phone,
                    address: customerInfo.address,
                    postalCode: customerInfo.postalCode,
                    country: customerInfo.country,
                    city: customerInfo.city
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
              } catch (paymentError: any) {
                console.error('Payment error:', paymentError);
                toast({
                  title: 'Payment Error',
                  description: paymentError.message || 'Failed to initiate payment. Please try again.',
                  variant: 'destructive'
                });
                setStep('otp');
              }
            }, 1000);
            return;
          } catch (authError: any) {
            console.error('Authentication failed:', authError);
            toast({
              title: 'Authentication Error',
              description: 'Failed to authenticate. Please try again.',
              variant: 'destructive'
            });
            setStep('otp');
            return;
          }
        } else {
          console.error('Invalid magic link format');
          toast({
            title: 'Authentication Error',
            description: 'Invalid authentication link.',
            variant: 'destructive'
          });
          setStep('otp');
          return;
        }
      }

      // If no magic link or direct auth, proceed with payment
      try {
        const paymentData = {
          amount: cartTotal,
          description: `Order for ${cartItems.length} digital design files`,
          customerInfo: {
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            email: customerInfo.email,
            mobile: customerInfo.phone,
            address: customerInfo.address,
            postalCode: customerInfo.postalCode,
            country: customerInfo.country,
            city: customerInfo.city
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
          // Clear cart - payment service will handle redirect
          clearCart();
        } else {
          throw new Error('Payment initiation failed');
        }
      } catch (error: any) {
        console.error('Payment error:', error);
        toast({
          title: 'Payment Error',
          description: error.message || 'Failed to initiate payment. Please try again.',
          variant: 'destructive'
        });
        setStep('otp');
      }
    } else {
      setOTPError(result.error || 'Invalid verification code');
      setStep('otp');
      setOTP('');
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
      toast({
        title: 'Code resent!',
        description: 'A new verification code has been sent to your email.'
      });
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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simple password hashing for temporary passwords
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };
  const updateCustomerInfo = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  const removeItem = (productId: number) => {
    // This would need to be implemented in ProductsContext
    console.log('Remove item:', productId);
  };
  if (cartItems.length === 0) {
    return null; // Will redirect via useEffect
  }
  return <Layout>
      <SEOHead title="Secure Checkout - Exhibit3Design" description="Complete your purchase with our secure, password-free checkout process." url="https://exhibit3design.com/checkout" />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
            <p className="text-muted-foreground">
              {step === 'info' && 'Complete your order information'}
              {step === 'otp' && 'Verify your email to complete the purchase'}
              {step === 'processing' && 'Processing your order...'}
            </p>
          </div>

          <div className="space-y-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>}
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
                  </div>)}
                
                <Separator />
                
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>€{cartTotal}</span>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {step === 'info' && 'Contact & Shipping Information'}
                    {step === 'otp' && 'Email Verification'}
                    {step === 'processing' && 'Processing Order'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {step === 'info' && <form onSubmit={handleInfoSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input id="firstName" value={customerInfo.firstName} onChange={e => updateCustomerInfo('firstName', e.target.value)} className={errors.firstName ? 'border-destructive' : ''} />
                          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input id="lastName" value={customerInfo.lastName} onChange={e => updateCustomerInfo('lastName', e.target.value)} className={errors.lastName ? 'border-destructive' : ''} />
                          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" value={customerInfo.email} onChange={e => updateCustomerInfo('email', e.target.value)} className={errors.email ? 'border-destructive' : ''} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" type="tel" value={customerInfo.phone} onChange={e => updateCustomerInfo('phone', e.target.value)} className={errors.phone ? 'border-destructive' : ''} />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input id="address" value={customerInfo.address} onChange={e => updateCustomerInfo('address', e.target.value)} className={errors.address ? 'border-destructive' : ''} />
                        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input id="city" value={customerInfo.city} onChange={e => updateCustomerInfo('city', e.target.value)} className={errors.city ? 'border-destructive' : ''} />
                          {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code *</Label>
                          <Input id="postalCode" value={customerInfo.postalCode} onChange={e => updateCustomerInfo('postalCode', e.target.value)} className={errors.postalCode ? 'border-destructive' : ''} />
                          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input id="country" value={customerInfo.country} onChange={e => updateCustomerInfo('country', e.target.value)} className={errors.country ? 'border-destructive' : ''} />
                        {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                      </div>

                      <Separator />

                      <div className="flex items-center items-start space-x-2">
                        <Checkbox id="privacy-policy" checked={policyAgreed} onCheckedChange={checked => setPolicyAgreed(checked as boolean)} />
                        <Label htmlFor="privacy-policy" className="text-sm leading-relaxed">
                          I agree to the{' '}
                          <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                          {' '}and consent to the processing of my personal data for order fulfillment.
                        </Label>
                      </div>

                      {otpError && <div className="text-sm text-destructive font-medium">
                          {otpError}
                        </div>}

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Sending Verification...' : 'Send Email Verification'}
                      </Button>
                    </form>}

                  {step === 'otp' && <form onSubmit={handleOTPSubmit} className="space-y-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          We sent a 4-digit verification code to
                        </p>
                        <p className="font-medium">{customerInfo.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Enter the code to verify your email and complete your order.
                        </p>
                      </div>

                      <OTPInput value={otp} onChange={setOTP} disabled={isLoading} error={otpError} label="Verification Code" />

                      {timeLeft > 0 && <div className="text-center text-sm text-muted-foreground">
                          Code expires in {formatTime(timeLeft)}
                        </div>}

                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleBackToInfo} className="flex-1" disabled={isLoading}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isLoading || !otp || otp.length !== 4}>
                          {isLoading ? 'Processing...' : 'Complete Order'}
                        </Button>
                      </div>

                      {timeLeft === 0 && <div className="text-center">
                          <Button type="button" variant="link" onClick={handleResendOTP} disabled={isResending} className="text-sm">
                            {isResending ? 'Resending...' : 'Resend verification code'}
                          </Button>
                        </div>}
                    </form>}

                  {step === 'processing' && <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p>Processing your order...</p>
                      <p className="text-sm text-muted-foreground">
                        Please do not close this window. You will be redirected to complete payment.
                      </p>
                    </div>}

                  {step === 'info' && <div className="mt-6 text-center text-sm text-muted-foreground">
                      <p>
                        🔒 Secure checkout powered by email verification
                      </p>
                      <p className="mt-2">
                        No password required. We'll create an account for you automatically.
                      </p>
                    </div>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>;
};
export default OTPCheckoutPage;