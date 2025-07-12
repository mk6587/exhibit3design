import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";

interface AuthError {
  message: string;
  status?: number;
}

interface AuthResult {
  error: AuthError | null;
  data?: any;
}

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Enhanced email confirmation handling
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const isConfirmation = searchParams.get('confirm') === 'true';
      
      // Handle Supabase auth tokens
      if (token && type === 'signup') {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });
          
          if (error) {
            console.error('Token verification failed:', error);
            setError('Email confirmation failed. Please try registering again.');
          } else {
            setConfirmationSuccess(true);
            toast({
              title: "Email confirmed!",
              description: "Your account has been activated. You can now sign in.",
            });
          }
        } catch (err) {
          console.error('Token verification error:', err);
          setError('Email confirmation failed. Please try registering again.');
        }
      } else if (isConfirmation) {
        // Handle simple confirmation flag
        setConfirmationSuccess(true);
        toast({
          title: "Email confirmed!",
          description: "Your account has been activated. You can now sign in.",
        });
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleSignIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error: { message: error.message, status: error.status } };
      }
      
      return { error: null, data };
    } catch (err) {
      return { error: { message: 'Network error. Please check your connection.' } };
    }
  };

  const handleSignUp = async (email: string, password: string): Promise<AuthResult> => {
    try {
      // Build proper redirect URL
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/auth?confirm=true`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) {
        return { error: { message: error.message, status: error.status } };
      }

      // Enhanced welcome email sending with better error handling
      if (data.user && !data.user.email_confirmed_at) {
        try {
          console.log('Sending welcome email to:', email);
          
          // Build confirmation URL with proper token
          const confirmationUrl = data.user.confirmation_sent_at 
            ? `${baseUrl}/auth?confirm=true&user_id=${data.user.id}`
            : redirectUrl;
          
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: email,
              confirmationUrl: confirmationUrl
            }
          });

          if (emailError) {
            console.error('Email function error:', emailError);
            // Don't fail registration if email fails, just log it
            toast({
              title: "Registration successful",
              description: "Account created but confirmation email may be delayed. Check your email in a few minutes.",
              variant: "default"
            });
          } else {
            console.log('Welcome email sent successfully:', emailData);
          }
        } catch (emailError: any) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail registration if email fails
        }
      }

      return { error: null, data };
    } catch (err) {
      return { error: { message: 'Network error. Please check your connection.' } };
    }
  };

  const handleResetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (!error) {
        toast({
          title: "Password reset email sent",
          description: "Check your email for password reset instructions.",
        });
      }

      return { error };
    } catch (err) {
      return { error: { message: 'Network error. Please check your connection.' } };
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowForgotPassword(false);

    // Client-side validation
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!isValidPassword(password)) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      if (isSignUpMode) {
        // Explicit sign up mode
        const { error: signUpError } = await handleSignUp(email, password);
        
        if (signUpError) {
          if (signUpError.message.includes('User already registered') || 
              signUpError.message.includes('already been registered')) {
            setError("An account with this email already exists. Try signing in instead.");
            setIsSignUpMode(false);
          } else {
            setError(signUpError.message);
          }
        } else {
          setRegistrationSuccess(true);
        }
      } else {
        // Try sign in first (default mode)
        const { error: signInError } = await handleSignIn(email, password);
        
        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            // Check if it's a new user or wrong password
            const { error: signUpError } = await handleSignUp(email, password);
            
            if (signUpError) {
              if (signUpError.message.includes('User already registered') || 
                  signUpError.message.includes('already been registered')) {
                // User exists, wrong password
                setError("Incorrect password for this account");
                setShowForgotPassword(true);
              } else {
                setError(signUpError.message);
              }
            } else {
              // New user registered successfully
              setRegistrationSuccess(true);
            }
          } else if (signInError.message.includes('Email not confirmed')) {
            setError("Please check your email and click the confirmation link before signing in");
          } else if (signInError.message.includes('Too many requests')) {
            setError("Too many login attempts. Please wait a few minutes before trying again");
          } else {
            setError(signInError.message);
          }
        } else {
          // Sign in successful
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          navigate("/profile");
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    const { error } = await handleResetPassword(email);
    if (error) {
      setError(error.message);
    } else {
      setShowForgotPassword(false);
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError(null);
    setShowForgotPassword(false);
  };
   
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                {isSignUpMode ? "Create Your Account" : "Sign In to Your Account"}
              </CardTitle>
              <CardDescription>
                {isSignUpMode 
                  ? "Join Exhibit3Design to access affordable exhibition stand files"
                  : "Access your purchased designs and buy affordable exhibition stand files"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {confirmationSuccess ? (
                <div className="text-center space-y-4">
                  <div className="mb-6">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Email Confirmed!</h3>
                    <p className="text-muted-foreground">
                      Your account has been activated successfully. You can now sign in.
                    </p>
                  </div>
                  
                  <Button 
                    variant="default" 
                    onClick={() => {
                      setConfirmationSuccess(false);
                      setIsSignUpMode(false);
                    }}
                    className="w-full"
                  >
                    Continue to Sign In
                  </Button>
                </div>
              ) : registrationSuccess ? (
                <div className="text-center space-y-4">
                  <div className="mb-6">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Registration Successful!</h3>
                    <p className="text-muted-foreground">
                      We've sent a confirmation email to <strong>{email}</strong>
                    </p>
                  </div>
                  
                  <Alert>
                    <AlertDescription>
                      Please check your email and click the confirmation link to activate your account. 
                      The email may take a few minutes to arrive. Don't forget to check your spam folder.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setRegistrationSuccess(false);
                        setEmail("");
                        setPassword("");
                        setError(null);
                        setIsSignUpMode(false);
                      }}
                      className="w-full"
                    >
                      Back to Sign In
                    </Button>
                    
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the email? Check your spam folder or contact support.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <Alert className="mb-4" variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="your@email.com"
                        required 
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password {isSignUpMode && <span className="text-sm text-muted-foreground">(minimum 6 characters)</span>}
                      </Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"}
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder={isSignUpMode ? "Create a secure password" : "Enter your password"}
                          required 
                          disabled={loading}
                          autoComplete={isSignUpMode ? "new-password" : "current-password"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {showForgotPassword && !isSignUpMode && (
                      <div className="text-sm">
                        <Button 
                          type="button" 
                          variant="link" 
                          className="p-0 h-auto text-primary hover:underline"
                          onClick={handleForgotPassword}
                          disabled={loading}
                        >
                          Forgot your password? Reset it here
                        </Button>
                      </div>
                    )}
                     
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? "Processing..." : (isSignUpMode ? "Create Account" : "Sign In")}
                    </Button>
                  </form>
                  
                  <div className="mt-4 text-center">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-sm"
                      onClick={toggleMode}
                      disabled={loading}
                    >
                      {isSignUpMode ? "Already have an account? Sign in" : "New to Exhibit3Design? Create account"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;