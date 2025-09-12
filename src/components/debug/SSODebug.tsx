import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ExternalLink, TestTube, CheckCircle, XCircle } from 'lucide-react';

interface DebugResult {
  step: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

export const SSODebug = () => {
  const { user, session, generateSSOToken } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);

  const addResult = (result: DebugResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testSSO = async () => {
    setTesting(true);
    clearResults();

    try {
      // Step 1: Check user authentication
      addResult({
        step: '1. User Authentication',
        status: user ? 'success' : 'error',
        message: user ? `Authenticated as ${user.email}` : 'No user authenticated',
        data: { userId: user?.id, email: user?.email }
      });

      if (!user) {
        addResult({
          step: 'Test Failed',
          status: 'error',
          message: 'Cannot test SSO without authentication'
        });
        return;
      }

      // Step 2: Check session
      addResult({
        step: '2. Session Check',
        status: session?.access_token ? 'success' : 'error',
        message: session?.access_token ? 'Valid session token found' : 'No valid session token',
        data: { hasAccessToken: !!session?.access_token, expiresAt: session?.expires_at }
      });

      // Step 3: Test browser capabilities
      const testUrl = 'https://designers.exhibit3design.com/auth';
      try {
        const urlTest = new URL(testUrl);
        addResult({
          step: '3. URL Parsing Test',
          status: 'success',
          message: `Successfully parsed test URL: ${urlTest.hostname}`,
          data: { protocol: urlTest.protocol, hostname: urlTest.hostname }
        });
      } catch (urlError) {
        addResult({
          step: '3. URL Parsing Test',
          status: 'error',
          message: `URL parsing failed: ${urlError}`,
          data: { error: urlError }
        });
      }

      // Step 4: Test SSO token generation
      addResult({
        step: '4. SSO Token Generation',
        status: 'pending',
        message: 'Generating SSO token...'
      });

      const { error, redirectUrl } = await generateSSOToken('https://designers.exhibit3design.com/auth');

      if (error) {
        addResult({
          step: '4. SSO Token Generation',
          status: 'error',
          message: `Token generation failed: ${error.message || 'Unknown error'}`,
          data: { error }
        });
      } else {
        addResult({
          step: '4. SSO Token Generation',
          status: 'success',
          message: 'SSO token generated successfully',
          data: { redirectUrl, hasRedirectUrl: !!redirectUrl }
        });

        // Step 5: Validate redirect URL
        if (redirectUrl) {
          try {
            const redirectUrlObj = new URL(redirectUrl);
            const hasToken = redirectUrlObj.searchParams.has('sso_token');
            const hasUser = redirectUrlObj.searchParams.has('sso_user');
            const hasEmail = redirectUrlObj.searchParams.has('sso_email');
            const hasExpires = redirectUrlObj.searchParams.has('sso_expires');

            addResult({
              step: '5. Redirect URL Validation',
              status: hasToken && hasUser && hasEmail && hasExpires ? 'success' : 'error',
              message: `Redirect URL validation: ${hasToken && hasUser && hasEmail && hasExpires ? 'Valid' : 'Missing parameters'}`,
              data: {
                url: redirectUrl,
                hasToken,
                hasUser,
                hasEmail,
                hasExpires,
                protocol: redirectUrlObj.protocol,
                hostname: redirectUrlObj.hostname
              }
            });

            // Step 6: Test redirect capabilities
            addResult({
              step: '6. Browser Redirect Test',
              status: 'success',
              message: 'Browser supports window.location.href redirects',
              data: {
                canRedirect: typeof window !== 'undefined' && !!window.location,
                userAgent: navigator.userAgent,
                cookieEnabled: navigator.cookieEnabled
              }
            });

          } catch (urlError) {
            addResult({
              step: '5. Redirect URL Validation',
              status: 'error',
              message: `Invalid redirect URL: ${urlError}`,
              data: { redirectUrl, error: urlError }
            });
          }
        }
      }

    } catch (error) {
      addResult({
        step: 'Test Exception',
        status: 'error',
        message: `Test failed with exception: ${error}`,
        data: { error }
      });
    } finally {
      setTesting(false);
    }
  };

  const testDirectRedirect = () => {
    const testUrl = 'https://designers.exhibit3design.com/auth?test=redirect';
    console.log('🔗 Testing direct redirect to:', testUrl);
    
    toast({
      title: "Redirect Test",
      description: "Attempting direct redirect to designers portal...",
    });

    try {
      window.location.href = testUrl;
    } catch (error) {
      console.error('❌ Direct redirect failed:', error);
      toast({
        title: "Redirect Failed",
        description: `Direct redirect failed: ${error}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          SSO Debug & QA Tool
        </CardTitle>
        <CardDescription>
          Test and debug the Single Sign-On (SSO) redirect functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testSSO} disabled={testing}>
            {testing ? 'Testing...' : 'Run SSO Test'}
          </Button>
          <Button variant="outline" onClick={testDirectRedirect}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Test Direct Redirect
          </Button>
          <Button variant="secondary" onClick={clearResults}>
            Clear Results
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test Results:</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                {result.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                )}
                {result.status === 'error' && (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                {result.status === 'pending' && (
                  <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mt-0.5 flex-shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{result.step}</div>
                  <div className="text-sm text-muted-foreground">{result.message}</div>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        Show details
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Browser Limitations & Common Issues:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>Popup Blockers:</strong> Some browsers block redirects not initiated by user interaction</li>
            <li>• <strong>Same-Site Cookies:</strong> Cross-domain redirects may lose session cookies</li>
            <li>• <strong>HTTPS Requirements:</strong> Modern browsers require HTTPS for cross-domain operations</li>
            <li>• <strong>Referrer Policy:</strong> Strict referrer policies can block cross-domain redirects</li>
            <li>• <strong>Content Security Policy:</strong> CSP headers may prevent redirects to external domains</li>
            <li>• <strong>Browser Extensions:</strong> Ad blockers and privacy extensions can interfere</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};