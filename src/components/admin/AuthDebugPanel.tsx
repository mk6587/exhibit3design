import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/contexts/SessionContext';

export const AuthDebugPanel = () => {
  const { user, isLoading } = useSession();
  const [cookies, setCookies] = useState<string[]>([]);
  const [authServiceReachable, setAuthServiceReachable] = useState<boolean | null>(null);

  useEffect(() => {
    // Parse cookies
    const allCookies = document.cookie.split(';').map(c => c.trim());
    setCookies(allCookies);

    // Test auth service reachability
    fetch('https://auth.exhibit3design.com/api/session', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        setAuthServiceReachable(res.ok);
      })
      .catch(() => {
        setAuthServiceReachable(false);
      });
  }, []);

  const sbCookies = cookies.filter(c => c.startsWith('sb-') || c.startsWith('sb_'));
  const hasSbCookie = sbCookies.length > 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Authentication Debug Panel
          <Badge variant={user ? 'default' : 'secondary'}>
            {user ? 'Authenticated' : 'Not Authenticated'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading State */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Loading:</span>
          <Badge variant={isLoading ? 'default' : 'outline'}>
            {isLoading ? 'Loading...' : 'Ready'}
          </Badge>
        </div>

        {/* User Info */}
        <div className="space-y-2">
          <span className="font-medium">User Data:</span>
          {user ? (
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <Badge variant="secondary">No user data</Badge>
          )}
        </div>

        {/* Auth Service Status */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Auth Service Reachable:</span>
          <Badge variant={authServiceReachable === true ? 'default' : authServiceReachable === false ? 'destructive' : 'outline'}>
            {authServiceReachable === null ? 'Testing...' : authServiceReachable ? 'Yes' : 'No (CORS/Network Error)'}
          </Badge>
        </div>

        {/* Cookie Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Supabase Cookie Present:</span>
            <Badge variant={hasSbCookie ? 'default' : 'destructive'}>
              {hasSbCookie ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          {sbCookies.length > 0 && (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Found cookies:</span>
              {sbCookies.map((cookie, i) => (
                <div key={i} className="bg-muted p-2 rounded text-xs">
                  {cookie.split('=')[0]}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Cookies */}
        <div className="space-y-2">
          <span className="font-medium">All Cookies ({cookies.length}):</span>
          <div className="bg-muted p-2 rounded text-xs max-h-32 overflow-auto">
            {cookies.length > 0 ? (
              cookies.map((cookie, i) => (
                <div key={i} className="truncate">
                  {cookie}
                </div>
              ))
            ) : (
              <span className="text-muted-foreground">No cookies found</span>
            )}
          </div>
        </div>

        {/* Diagnosis */}
        <div className="space-y-2 pt-4 border-t">
          <span className="font-medium">Diagnosis:</span>
          <div className="space-y-1 text-sm">
            {!authServiceReachable && (
              <div className="text-destructive">
                ❌ Cannot reach auth.exhibit3design.com - CORS or network issue
              </div>
            )}
            {authServiceReachable && !hasSbCookie && (
              <div className="text-destructive">
                ❌ Auth service reachable but no sb- cookie set. The auth service must set cookies with Domain=.exhibit3design.com
              </div>
            )}
            {authServiceReachable && hasSbCookie && !user && (
              <div className="text-yellow-600">
                ⚠️ Cookie exists but session API returned no user. Check cookie validity.
              </div>
            )}
            {user && (
              <div className="text-green-600">
                ✅ Authentication working correctly!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
