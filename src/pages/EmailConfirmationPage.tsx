import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import exhibit3Logo from '@/assets/exhibit3design-logo.png';

export default function EmailConfirmationPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('🔍 Starting email confirmation process');
        console.log('🔗 Full URL:', window.location.href);
        console.log('🔗 Hash:', window.location.hash);
        console.log('🔗 Search params:', window.location.search);
        
        // Check if we have URL fragment (hash) parameters first
        const hash = window.location.hash;
        
        if (hash && hash.includes('access_token')) {
          // Parse hash parameters
          const hashParams = new URLSearchParams(hash.substring(1)); // Remove the #
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const expiresAt = hashParams.get('expires_at');
          const tokenType = hashParams.get('token_type');
          const type = hashParams.get('type');
          
          if (accessToken && type === 'signup') {
            // Set the session manually using the tokens from the hash
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (error) {
              console.error('Session setup error:', error);
              setError('Failed to confirm your email. Please try again.');
              return;
            }
            
            if (data?.session) {
              setSuccess(true);
              toast({
                title: "Email confirmed successfully!",
                description: "Welcome to Exhibit3Design. You are now logged in.",
              });
              
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);
              
              // Redirect to home page after a short delay
              setTimeout(() => {
                navigate('/');
              }, 2000);
              
              return;
            }
          }
        }
        
        // Check if user is already authenticated (might have been confirmed already)
        console.log('🔍 Checking existing session...');
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('📝 Session data:', sessionData);
        
        if (sessionData?.session?.user) {
          console.log('✅ User already authenticated!');
          setSuccess(true);
          toast({
            title: "Email confirmed successfully!",
            description: "Welcome to Exhibit3Design. You are now logged in.",
          });
          
          setTimeout(() => {
            navigate('/');
          }, 2000);
          return;
        }
        
        // Fallback to legacy confirmation flow with token_hash
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        console.log('🔍 Token hash:', token_hash, 'Type:', type);

        if (!token_hash && !hash) {
          console.log('❌ No confirmation parameters found');
          setError('Invalid confirmation link');
          return;
        }

        // Verify the token hash with Supabase
        const { data, error: confirmError } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any || 'signup'
        });

        if (confirmError) {
          console.error('Email confirmation error:', confirmError);
          if (confirmError.message.includes('expired')) {
            setError('This confirmation link has expired. Please sign up again.');
          } else if (confirmError.message.includes('invalid')) {
            setError('This confirmation link is invalid or has already been used.');
          } else {
            setError('Failed to confirm your email. Please try again.');
          }
          return;
        }

        if (data?.user) {
          setSuccess(true);
          toast({
            title: "Email confirmed successfully!",
            description: "Welcome to Exhibit3Design. You are now logged in.",
          });
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } catch (error) {
        console.error('Confirmation process error:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        if (!success) {
          setLoading(false);
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/10 p-4">
      <div className="w-full max-w-lg">
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src={exhibit3Logo} 
                alt="Exhibit3Design" 
                className="h-16 w-auto opacity-90"
              />
            </div>
            
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {loading && (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                  <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
                </div>
              )}
              {success && (
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
                  <CheckCircle className="h-16 w-16 text-green-500 relative z-10" />
                  <Sparkles className="h-6 w-6 text-accent absolute -top-1 -right-1 animate-bounce" />
                </div>
              )}
              {error && (
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/20 rounded-full"></div>
                  <XCircle className="h-16 w-16 text-destructive relative z-10" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {loading && "Confirming your email..."}
              {success && "Welcome to Exhibit3Design!"}
              {error && "Confirmation Failed"}
            </CardTitle>
            
            <CardDescription className="text-base text-muted-foreground mt-4 leading-relaxed">
              {loading && "Please wait while we verify your email address and complete your registration."}
              {success && "Your email has been confirmed successfully! You're now logged in and will be redirected shortly."}
              {error && error}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center pb-8">
            {success && (
              <div className="space-y-6">
                <div className="relative overflow-hidden p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10"></div>
                  <div className="relative z-10">
                    <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      🎉 Congratulations! You now have access to professional exhibition stand design files at affordable prices!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                      Professional designs • Instant downloads • 80% cost savings
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg transition-all duration-300 group"
                >
                  Continue to Exhibit3Design
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
            
            {error && (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm text-destructive">
                    We couldn't confirm your email. This might be because the link has expired or has already been used.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full h-12"
                  variant="outline"
                >
                  Back to Sign Up
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}