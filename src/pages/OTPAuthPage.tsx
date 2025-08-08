import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OTPInput } from '@/components/ui/otp-input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOTPAuth } from '@/contexts/OTPAuthContext';
import { useProducts } from '@/contexts/ProductsContext';
import Layout from '@/components/layout/Layout';
import SEOHead from '@/components/SEO/SEOHead';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const OTPAuthPage = () => {
  const [email, setEmail] = useState('mahsa.k8407@gmail.com');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOTP] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const { sendOTP, verifyOTP, isLoading } = useOTPAuth();
  const { cartItems } = useProducts();
  
  // Calculate total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Timer for OTP expiration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && step === 'otp') {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, step]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    const result = await sendOTP(email);
    
    if (result.success) {
      setStep('otp');
      setTimeLeft(120); // 2 minutes
      // No toast notification - keep the UI clean
    } else {
      setError(result.error || 'Failed to send verification code');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 4) {
      setError('Please enter a 4-digit code');
      return;
    }

    const result = await verifyOTP(email, otp);
    
    if (result.success) {
      // Immediately redirect without any success notifications
      if (result.magicLink) {
        window.location.href = result.magicLink;
      } else {
        window.location.href = '/';
      }
    } else {
      setError(result.error || 'Invalid verification code');
      setOTP('');
    }
  };

  const handleResendCode = async () => {
    if (isResending) return;
    
    setIsResending(true);
    setError('');
    
    const result = await sendOTP(email);
    
    if (result.success) {
      setTimeLeft(120);
      setOTP('');
      // No toast notification - keep the UI clean
    } else {
      setError(result.error || 'Failed to resend code');
    }
    
    setIsResending(false);
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOTP('');
    setTimeLeft(0);
    setError('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <SEOHead 
        title="Checkout - Exhibit3Design"
        description="Complete your order with secure authentication"
        url="https://exhibit3design.com/auth"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Order Summary Section */}
          <div className="lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length > 0 ? (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">€{item.price}</p>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total</span>
                        <span>€{getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <div className="flex-1">
                        <p className="font-medium">Futuristic stand design</p>
                        <p className="text-sm text-muted-foreground">Qty: 1</p>
                      </div>
                      <p className="font-medium">€8</p>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total</span>
                        <span>€8.00</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information Section */}
          <div className="lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Your Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="mahsa.k8407@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed (from your account)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number *</Label>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        placeholder="+441234567890"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Enter your full address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-destructive font-medium">
                      {error}
                    </div>
                  )}

                  {step === 'email' ? (
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Continue to Payment'}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          We sent a 4-digit code to
                        </p>
                        <p className="font-medium">{email}</p>
                      </div>

                      <OTPInput
                        value={otp}
                        onChange={setOTP}
                        disabled={isLoading}
                        error={error}
                        label="Verification Code"
                      />

                      {timeLeft > 0 && (
                        <div className="text-center text-sm text-muted-foreground">
                          Code expires in {formatTime(timeLeft)}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToEmail}
                          className="flex-1"
                          disabled={isLoading}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button 
                          type="button"
                          onClick={handleVerifyOTP}
                          className="flex-1" 
                          disabled={isLoading || !otp || otp.length !== 4}
                        >
                          {isLoading ? 'Verifying...' : 'Complete Order'}
                        </Button>
                      </div>

                      {timeLeft === 0 && (
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="link"
                            onClick={handleResendCode}
                            disabled={isResending}
                            className="text-sm"
                          >
                            {isResending ? 'Resending...' : 'Resend verification code'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OTPAuthPage;