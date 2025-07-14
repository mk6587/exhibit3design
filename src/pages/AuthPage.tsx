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

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
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
      if (isLogin) {
        // Try to sign in
        const { error } = await signIn(email, password);
        
        if (error) {
          // Check if it's a credentials error
          if (error.message.includes('Invalid login credentials') || 
              error.message.includes('Email not confirmed')) {
            setError('Invalid email or password. Would you like to reset your password?');
            setShowForgotPassword(true);
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate('/');
        }
      } else {
        // Try to sign up
        const { error } = await signUp(email, password);
        
        if (error) {
          if (error.message.includes('User already registered')) {
            setError('This email is already registered. Please sign in instead.');
            setIsLogin(true);
          } else {
            setError(error.message);
          }
        } else {
          setEmailSent(true);
          toast({
            title: "Registration successful!",
            description: "Please check your email for a confirmation link.",
          });
        }
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
      // Send password reset email using custom SMTP
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to your account to continue' 
              : 'Sign up for a new account to get started'
            }
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
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Sign Up'}
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
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setShowForgotPassword(false);
              }}
              className="text-sm"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}