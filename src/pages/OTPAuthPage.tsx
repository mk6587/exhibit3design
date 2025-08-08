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
import Layout from '@/components/layout/Layout';
import SEOHead from '@/components/SEO/SEOHead';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const OTPAuthPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const { sendOTP, verifyOTP, isLoading } = useOTPAuth();
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
        title="Login - Exhibit3Design"
        description="Access your account with our secure, password-free login system."
        url="https://exhibit3design.com/auth"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              {step === 'email' ? 'Enter your email to receive a verification code' : 'Enter the code sent to your email'}
            </p>
          </div>

          <Card className="border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {step === 'email' ? 'Sign In' : 'Verify Email'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 'email' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-destructive font-medium">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
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
                      type="submit" 
                      className="flex-1" 
                      disabled={isLoading || !otp || otp.length !== 4}
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Sign In'}
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
                </form>
              )}

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                  No passwords required. We'll send you a secure code each time you sign in.
                </p>
                <p className="mt-2">
                  By continuing, you agree to our{' '}
                  <Link to="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OTPAuthPage;