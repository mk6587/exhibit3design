import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import PrivacyPolicyCheckbox from '@/components/common/PrivacyPolicyCheckbox';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
// AuthPage component with unified login/register flow
export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // First, try to sign in
      const { error: loginError } = await signIn(email, password);
      
      if (loginError) {
        // Check if it's a credentials error
        if (loginError.message.includes('Invalid login credentials')) {
          // User doesn't exist - check privacy policy agreement for registration
          if (!policyAgreed) {
            setError('You must agree to the Privacy Policy to create an account');
            setLoading(false);
            return;
          }
          
          // Start registration flow
          const { error: signUpError } = await signUp(email, password);
          
          if (signUpError) {
            setError(signUpError.message);
          } else {
            // Registration email sent - show message
            setEmailSent(true);
            // Store privacy policy agreement in localStorage
            localStorage.setItem("privacy_policy_acknowledged", "true");
          }
        } else if (loginError.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else if (loginError.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else if (loginError.message.includes('too many requests')) {
          setError('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          setError(loginError.message);
        }
      } else {
        // Login successful
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate('/');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError('Failed to send password reset email. Please try again.');
      } else {
        setEmailSent(true);
        toast({
          title: "Password reset email sent",
          description: "Check your email for password reset instructions.",
        });
      }
    } catch (error: any) {
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 bg-gradient-to-br from-background via-background to-muted">
          <Card className="w-full max-w-md shadow-lg border-2">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
              <CardDescription className="text-base">
                We've sent a confirmation email to<br />
                <span className="font-semibold text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click the confirmation link in your email to activate your account
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    setPassword('');
                    setError(null);
                    setShowForgotPassword(false);
                  }}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Main Login/Register Screen
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 bg-gradient-to-br from-background via-background to-muted">
        <Card className="w-full max-w-md shadow-lg border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to Exhibit3Design</CardTitle>
            <CardDescription className="text-base">
              Enter your email and password to sign in or register
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  title="Please enter a valid email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password (6+ characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  required
                  minLength={6}
                  title="Password must be at least 6 characters long"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>

              {showForgotPassword && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleForgotPassword}
                  className="w-full"
                  disabled={loading}
                >
                  Send Password Reset Email
                </Button>
              )}

              <div className="flex justify-between items-center mt-4">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowForgotPassword(!showForgotPassword)}
                  className="text-sm"
                >
                  {showForgotPassword ? 'Back to Login' : 'Forgot Password?'}
                </Button>
              </div>
              
              <div className="mt-4">
                <PrivacyPolicyCheckbox
                  checked={policyAgreed}
                  onCheckedChange={setPolicyAgreed}
                  className="mb-3"
                />
              </div>

              <div className="text-center text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                If you don't have an account, we'll create one for you with email verification
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}