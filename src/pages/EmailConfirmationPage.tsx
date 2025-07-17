import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function EmailConfirmationPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!token_hash || type !== 'signup') {
          setError('Invalid confirmation link');
          return;
        }

        // Verify the token hash with Supabase
        const { data, error: confirmError } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'signup'
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
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {loading && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            {success && <CheckCircle className="h-12 w-12 text-green-500" />}
            {error && <XCircle className="h-12 w-12 text-destructive" />}
          </div>
          
          <CardTitle className="text-2xl">
            {loading && "Confirming your email..."}
            {success && "Welcome to Exhibit3Design!"}
            {error && "Confirmation Failed"}
          </CardTitle>
          
          <CardDescription>
            {loading && "Please wait while we verify your email address."}
            {success && "Your email has been confirmed successfully. You will be redirected to the homepage shortly."}
            {error && error}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          {success && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  🎉 You now have access to professional exhibition stand design files at affordable prices!
                </p>
              </div>
              <Button onClick={() => navigate('/')} className="w-full">
                Continue to Exhibit3Design
              </Button>
            </div>
          )}
          
          {error && (
            <div className="space-y-4">
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full"
                variant="outline"
              >
                Back to Sign Up
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}