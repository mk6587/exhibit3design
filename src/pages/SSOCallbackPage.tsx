import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SSOCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing SSO authentication...');

  useEffect(() => {
    const ssoToken = searchParams.get('sso_token');
    const ssoUser = searchParams.get('sso_user');
    const ssoEmail = searchParams.get('sso_email');
    const ssoExpires = searchParams.get('sso_expires');

    console.log('🔗 SSO Callback: Processing SSO parameters', {
      hasToken: !!ssoToken,
      hasUser: !!ssoUser,
      hasEmail: !!ssoEmail,
      hasExpires: !!ssoExpires,
      currentTime: Math.floor(Date.now() / 1000),
      expiresAt: ssoExpires ? parseInt(ssoExpires) : null
    });

    if (!ssoToken) {
      setStatus('error');
      setMessage('Missing SSO token. Please try logging in again.');
      return;
    }

    // Check if token is expired
    if (ssoExpires) {
      const expiresAt = parseInt(ssoExpires);
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > expiresAt) {
        setStatus('error');
        setMessage('SSO token has expired. Please try logging in again.');
        return;
      }
    }

    // Simulate processing time for better UX
    setTimeout(() => {
      console.log('🔗 SSO Callback: Token validation complete');
      setStatus('success');
      setMessage(`Welcome ${ssoEmail || 'User'}! Redirecting to dashboard...`);
      
      // Redirect to dashboard after showing success message
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    }, 1500);
  }, [searchParams, navigate]);

  const handleRetry = () => {
    const mainSiteUrl = 'https://exhibit3design.com/sso-login?return_url=' + 
                        encodeURIComponent(window.location.origin + '/dashboard');
    window.location.href = mainSiteUrl;
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <Layout
      title="SSO Authentication - Designers Portal"
      description="Processing single sign-on authentication"
    >
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {status === 'processing' && (
              <>
                <div className="mb-6">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  Authenticating...
                </h1>
                <p className="text-gray-600">
                  {message}
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mb-6">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  Authentication Successful!
                </h1>
                <p className="text-gray-600">
                  {message}
                </p>
                <div className="mt-4">
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mb-6">
                  <XCircle className="h-12 w-12 mx-auto text-red-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  Authentication Failed
                </h1>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={handleRetry}
                    className="w-full"
                    size="lg"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={handleGoHome}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Go to Home
                  </Button>
                </div>
              </>
            )}
            
            <p className="text-xs text-gray-500 mt-6">
              Secure authentication powered by Exhibit3Design
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SSOCallbackPage;