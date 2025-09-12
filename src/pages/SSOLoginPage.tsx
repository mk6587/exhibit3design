import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const SSOLoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, generateSSOToken } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const returnUrl = searchParams.get('return_url') || searchParams.get('referer') || 'https://designers.exhibit3design.com';

  useEffect(() => {
    // If not logged in, immediately redirect to auth - no intermediate page
    if (user === null) {
      console.log('🔐 SSO: No user - redirecting directly to /auth with stored return URL', { returnUrl });
      try {
        sessionStorage.setItem('sso_return_url', returnUrl);
      } catch {}
      navigate('/auth', { replace: true });
      return;
    }

    // If user is already logged in, immediately redirect with SSO token
    if (user) {
      console.log('🔗 SSO: User detected, starting SSO redirect process', { user: user.email, returnUrl });
      handleSSORedirect();
    }
  }, [user]);

  // Don't render anything if we're about to redirect
  if (user === null) {
    return null;
  }

  const handleSSORedirect = async () => {
    if (!user) {
      console.log('❌ SSO: No user found, redirecting to auth');
      toast({
        title: "Authentication Required",
        description: "Please log in first to access the portal.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    console.log('🚀 SSO: Starting token generation for user:', user.email);
    setLoading(true);
    
    try {
      const { error, redirectUrl } = await generateSSOToken(returnUrl);
      
      console.log('🔗 SSO: Token generation result:', { error, redirectUrl, hasRedirectUrl: !!redirectUrl });
      
      if (error) {
        console.error('❌ SSO: Token generation failed:', error);
        toast({
          title: "SSO Error",
          description: error.message || "Failed to generate SSO token. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (redirectUrl) {
        console.log('✅ SSO: Redirecting to:', redirectUrl);
        
        // Validate the URL before redirecting
        try {
          const url = new URL(redirectUrl);
          if (url.protocol === 'https:' || url.protocol === 'http:') {
            console.log('✅ SSO: Valid URL, proceeding with redirect');
            window.location.href = redirectUrl;
          } else {
            console.error('❌ SSO: Invalid URL protocol:', url.protocol);
            throw new Error('Invalid redirect URL protocol');
          }
        } catch (urlError) {
          console.error('❌ SSO: Invalid redirect URL:', redirectUrl, urlError);
          toast({
            title: "SSO Error",
            description: "Invalid redirect URL received. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
        }
      } else {
        console.error('❌ SSO: No redirect URL returned');
        toast({
          title: "SSO Error",
          description: "No redirect URL received. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ SSO: Exception during token generation:', error);
      toast({
        title: "SSO Error", 
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Store return URL for after login
    sessionStorage.setItem('sso_return_url', returnUrl);
    navigate('/auth');
  };

  return (
    <Layout
      title="SSO Login - Exhibit3Design"
      description="Single Sign-On portal access"
    >
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Portal Access
            </h1>
            
            {user ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Redirecting you to the portal...
                </p>
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
                <Button 
                  onClick={handleSSORedirect}
                  disabled={loading}
                  className="w-full"
                  variant={loading ? "secondary" : "default"}
                >
                  {loading ? "Generating Token..." : "Continue to Portal"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Please log in to access the portal.
                </p>
                <Button 
                  onClick={handleLogin}
                  className="w-full"
                  size="lg"
                >
                  Login to Continue
                </Button>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-4">
              You will be redirected to: {new URL(returnUrl).hostname}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SSOLoginPage;