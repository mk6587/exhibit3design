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
import { trackPageView, trackAuthEvent } from '@/services/ga4Analytics';
import { setAuthRedirect, getAndClearAuthRedirect } from '@/utils/authRedirect';

// Cloudflare Turnstile site key from environment variables
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

const OTPAuthPage = () => {
  // Get email and next redirect from URL params if available
  const searchParams = new URLSearchParams(window.location.search);
  const emailFromUrl = searchParams.get('email') || '';
  const nextUrl = searchParams.get('next');
  const isEmbedded = searchParams.get('embedded') === 'true';
  
  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOTP] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  const { toast } = useToast();
  const { user, signInWithGoogle } = useAuth();
  const { sendOTP, verifyOTP, isLoading } = useOTPAuth();
  const navigate = useNavigate();

  // Store redirect URL if provided
  useEffect(() => {
    if (nextUrl) {
      setAuthRedirect(nextUrl);
    }
  }, [nextUrl]);
  
  // Refs for focus management
  const otpInputRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<TurnstileCaptchaRef>(null);

  // Track page view
  useEffect(() => {
    trackPageView('/auth', 'Login - Secure Authentication');
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectUrl = getAndClearAuthRedirect();
      navigate(redirectUrl || '/');
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
      toast({
        title: "Security Verification Required",
        description: "Please complete the captcha to continue.",
        variant: "destructive",
      });
      return;
    }

    console.log('📧 Sending OTP to:', email);
    const result = await sendOTP(email, undefined, captchaToken);
    console.log('📧 Send OTP result:', result);
    
    if (result.success) {
      console.log('✅ OTP sent successfully');
      toast({
        title: "Code Sent",
        description: "Check your email for the verification code.",
        variant: "default",
      });
      setStep('otp');
      setTimeLeft(300); // 5 minutes
      // Reset captcha after successful send
      captchaRef.current?.reset();
      setCaptchaToken('');
      // Focus the OTP input after successfully sending the code
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } else {
      console.error('❌ Failed to send OTP:', result.error);
      // Reset captcha on error
      captchaRef.current?.reset();
      setCaptchaToken('');
      setError(result.error || 'Failed to send verification code');
      toast({
        title: "Failed to Send Code",
        description: result.error || 'Failed to send verification code. Please try again.',
        variant: "destructive",
      });
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
      // If embedded mode, send postMessage to opener and close
      if (isEmbedded && result.user) {
        try {
          // Get JWT token for AI Studio
          const { data: tokenData, error: tokenError } = await supabase.functions.invoke('auth-postmessage', {
            body: { 
              userId: result.user.id, 
              email: result.user.email 
            }
          });

          if (tokenError || !tokenData?.token) {
            throw new Error('Failed to generate authentication token');
          }

          // Send auth success message to AI Studio
          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'auth-success',
                token: tokenData.token,
                userId: result.user.id,
                email: result.user.email
              },
              'https://ai.exhibit3design.com'
            );
          }

          // Show success message and auto-close
          toast({
            title: "Authentication Successful",
            description: "Redirecting you back to AI Studio...",
          });

          setTimeout(() => {
            window.close();
          }, 1500);
          
          return;
        } catch (error) {
          console.error('Failed to send postMessage:', error);
          setError('Authentication successful, but failed to communicate with AI Studio. Please try again.');
          return;
        }
      }

      // Regular flow (non-embedded)
      if (result.magicLink) {
        // Redirect to the magic link
        window.location.href = result.magicLink;
      } else {
        // Check for stored redirect URL, otherwise go to home
        const redirectUrl = getAndClearAuthRedirect();
        navigate(redirectUrl || '/');
      }
    } else {
      // Show specific error messages based on error type
      const errorMsg = result.error || 'Invalid verification code';
      
      if (result.errorType === 'code_expired') {
        setError('This code has expired. Please request a new code.');
        toast({
          title: "Code Expired",
          description: "Your verification code has expired. Click 'Resend' to get a new one.",
          variant: "destructive",
        });
      } else if (result.errorType === 'code_already_used') {
        setError('This code has already been used. Please request a new code.');
        toast({
          title: "Code Already Used",
          description: "This verification code was already used. Please request a new one.",
          variant: "destructive",
        });
      } else if (result.errorType === 'no_code_found') {
        setError('No verification code found. Please request a new code.');
        toast({
          title: "No Code Found",
          description: "We couldn't find a verification code for this email. Please request a new one.",
          variant: "destructive",
        });
      } else if (result.errorType === 'incorrect_code') {
        setError('Incorrect verification code. Please check and try again.');
        toast({
          title: "Incorrect Code",
          description: "The code you entered is incorrect. Please double-check and try again.",
          variant: "destructive",
        });
      } else {
        setError(errorMsg);
      }
      
      setOTP('');
    }
  };

  const handleResendCode = async () => {
    if (isResending) return;
    
    setIsResending(true);
    setError('');
    
    if (!captchaToken) {
      setError('Please complete the security verification to resend code');
      toast({
        title: "Security Verification Required",
        description: "Please complete the captcha verification before resending the code.",
        variant: "destructive",
      });
      setIsResending(false);
      return;
    }
    
    console.log('🔄 Resending OTP to:', email);
    const result = await sendOTP(email, undefined, captchaToken);
    
    if (result.success) {
      console.log('✅ OTP resent successfully');
      setTimeLeft(300); // 5 minutes
      setOTP('');
      // Reset captcha after successful resend
      captchaRef.current?.reset();
      setCaptchaToken('');
      toast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email.",
        variant: "default",
      });
      // Focus the OTP input after successfully resending the code
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } else {
      console.error('❌ Failed to resend OTP:', result.error);
      // Reset captcha on error
      captchaRef.current?.reset();
      setCaptchaToken('');
      setError(result.error || 'Failed to resend code');
      toast({
        title: "Failed to Resend",
        description: result.error || 'Failed to resend verification code. Please try again.',
        variant: "destructive",
      });
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
                    <Label>Security Verification</Label>
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
                        <Label>Security Verification for Resend</Label>
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