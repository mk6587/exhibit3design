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
import { Loader2 } from 'lucide-react';
// AuthPage component with unified login/register flow
export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
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
          // User doesn't exist - start registration flow
          const { error: signUpError } = await signUp(email, password);
          
          if (signUpError) {
            setError(signUpError.message);
          } else {
            // Registration email sent - show message
            setEmailSent(true);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent an email to {email} with further instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Login/Register Screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
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
            
            <div className="text-center text-xs text-muted-foreground">
              If you don't have an account, we'll create one for you with email verification
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}