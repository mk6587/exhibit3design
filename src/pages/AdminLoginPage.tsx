
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { adminLoginSchema } from '@/lib/validationSchemas';
import { TurnstileCaptcha, TurnstileCaptchaRef } from '@/components/ui/turnstile-captcha';

// Cloudflare Turnstile site key from environment variables
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const captchaRef = useRef<TurnstileCaptchaRef>(null);
  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/admin';
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      toast({
        title: "Verification required",
        description: "Please complete the security verification",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Validate credentials with Zod
      const validatedData = adminLoginSchema.parse({ email, password });

      const result = await login(validatedData.email, validatedData.password, captchaToken);
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        const redirect = searchParams.get('redirect') || '/admin';
        navigate(redirect, { replace: true });
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid credentials or insufficient privileges",
          variant: "destructive",
        });
        // Reset captcha on failure
        captchaRef.current?.reset();
        setCaptchaToken('');
      }
    } catch (validationError: any) {
      console.error('Login error:', validationError);
      if (validationError.errors) {
        // Zod validation error
        const errorMessage = validationError.errors.map((err: any) => err.message).join(', ');
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: validationError.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
      // Reset captcha on error
      captchaRef.current?.reset();
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <TurnstileCaptcha
                ref={captchaRef}
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={(token) => setCaptchaToken(token)}
                onError={() => {
                  toast({
                    title: "Verification error",
                    description: "Failed to load security verification. Please refresh the page.",
                    variant: "destructive",
                  });
                }}
                onExpire={() => {
                  setCaptchaToken('');
                  toast({
                    title: "Verification expired",
                    description: "Please verify again",
                    variant: "destructive",
                  });
                }}
                className="flex justify-center"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !captchaToken}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
