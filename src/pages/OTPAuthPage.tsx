import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OTPInput } from '@/components/ui/otp-input';
import { TurnstileCaptcha, TurnstileCaptchaRef } from '@/components/ui/turnstile-captcha';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOTPAuth } from '@/contexts/OTPAuthContext';
import Layout from '@/components/layout/Layout';
import SEOHead from '@/components/SEO/SEOHead';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { otpSchema } from '@/lib/validationSchemas';

// Turnstile test site key - always passes
const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';

const OTPAuthPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  const { toast } = useToast();
  const { user, signInWithGoogle } = useAuth();
  const { sendOTP, verifyOTP, isLoading } = useOTPAuth();
  const navigate = useNavigate();
  
  // Refs for focus management
  const otpInputRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<TurnstileCaptchaRef>(null);

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

    try {
      // Validate email with Zod (we only validate email, not OTP at this stage)
      const emailValidation = otpSchema.pick({ email: true }).parse({ email });
    } catch (validationError: any) {
      if (validationError.errors) {
        setError(validationError.errors[0]?.message || 'Invalid email address');
      } else {
        setError('Invalid email address');
      }
      return;
    }

    if (!captchaToken) {
      setError('Please complete the security verification');
      return;
    }

    const result = await sendOTP(email, undefined, captchaToken);
    
    if (result.success) {
      setStep('otp');
      setTimeLeft(120); // 2 minutes
      // Reset captcha after successful send
      captchaRef.current?.reset();
      setCaptchaToken('');
      // Focus the OTP input after successfully sending the code
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } else {
      // Reset captcha on error
      captchaRef.current?.reset();
      setCaptchaToken('');
      setError(result.error || 'Failed to send verification code');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate both email and OTP with Zod
      // Note: OTP schema expects 6 digits, but we're using 4-digit OTPs
      // So we'll validate manually for the 4-digit requirement
      if (!otp || otp.length !== 4) {
        setError('Please enter a 4-digit code');
        return;
      }
      if (!/^\d{4}$/.test(otp)) {
        setError('OTP must contain only numbers');
        return;
      }
    } catch (validationError: any) {
      if (validationError.errors) {
        setError(validationError.errors[0]?.message || 'Invalid input');
      } else {
        setError('Invalid input');
      }
      return;
    }

    const result = await verifyOTP(email, otp);
    
    if (result.success) {
      if (result.magicLink) {
        // Simply redirect to the magic link - let Supabase handle the authentication
        // The redirect will be handled by AuthContext after successful login
        window.location.href = result.magicLink;
      } else {
        // Check for stored redirect URL
        const redirectUrl = sessionStorage.getItem('auth_redirect_url');
        if (redirectUrl) {
          sessionStorage.removeItem('auth_redirect_url');
          window.location.href = redirectUrl;
        } else {
          navigate('/');
        }
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
    
    if (!captchaToken) {
      setError('Please complete the security verification to resend code');
      setIsResending(false);
      return;
    }
    
    const result = await sendOTP(email, undefined, captchaToken);
    
    if (result.success) {
      setTimeLeft(120);
      setOTP('');
      // Reset captcha after successful resend
      captchaRef.current?.reset();
      setCaptchaToken('');
      // Focus the OTP input after successfully resending the code
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } else {
      // Reset captcha on error
      captchaRef.current?.reset();
      setCaptchaToken('');
      setError(result.error || 'Failed to resend code');
    }
    
    setIsResending(false);
  };

  const handleSocialLogin = async () => {
    setError('');
    
    try {
      // Note: The redirect URL will be checked and used by AuthContext after OAuth completes
      const result = await signInWithGoogle();
      
      if (result.error) {
        setError(result.error.message || 'Failed to sign in with Google');
      }
      // If successful, the OAuth flow will handle the redirect
      // AuthContext will check for stored redirect URL after successful login
    } catch (error) {
      setError('An error occurred while signing in with Google');
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOTP('');
    setTimeLeft(0);
    setError('');
    setCaptchaToken('');
    captchaRef.current?.reset();
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
                <div className="space-y-6">
                  {/* Social Login Options */}
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2"
                      onClick={handleSocialLogin}
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                      </div>
                    </div>
                  </div>

                  {/* Email Form */}
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

                  <div className="space-y-2">
                    <Label>Security Verification (Test Mode)</Label>
                    <TurnstileCaptcha
                      ref={captchaRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onVerify={setCaptchaToken}
                      onError={() => {
                        setCaptchaToken('');
                        setError('Security verification failed. Please try again.');
                      }}
                      onExpire={() => {
                        setCaptchaToken('');
                        setError('Security verification expired. Please verify again.');
                      }}
                      className="flex justify-center"
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
                    disabled={isLoading || !captchaToken}
                  >
                    {isLoading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </form>
              </div>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      We sent a 4-digit code to
                    </p>
                    <p className="font-medium">{email}</p>
                  </div>

                  <OTPInput
                    ref={otpInputRef}
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
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Security Verification for Resend (Test Mode)</Label>
                        <TurnstileCaptcha
                          ref={captchaRef}
                          siteKey={TURNSTILE_SITE_KEY}
                          onVerify={setCaptchaToken}
                          onError={() => {
                            setCaptchaToken('');
                            setError('Security verification failed. Please try again.');
                          }}
                          onExpire={() => {
                            setCaptchaToken('');
                            setError('Security verification expired. Please verify again.');
                          }}
                          className="flex justify-center"
                        />
                      </div>
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleResendCode}
                          disabled={isResending || !captchaToken}
                          className="text-sm"
                        >
                          {isResending ? 'Resending...' : 'Resend verification code'}
                        </Button>
                      </div>
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