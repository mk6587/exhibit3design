# AI Studio Integration Guide
## Token Refresh System Integration

### Quick Start - Testing the Endpoint

#### 1. Test with cURL
```bash
# Replace YOUR_VALID_JWT_TOKEN with an actual token from exhibit3design
curl -X POST https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/refresh-auth-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN"

# Expected Response (Success):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": 1234567890000,
  "userId": "user-uuid-here"
}

# Expected Response (Unauthorized):
{
  "error": "Invalid or expired token"
}
```

#### 2. Test with JavaScript (Browser Console)
```javascript
// Open AI Studio in browser, paste this in console:
const testToken = "YOUR_VALID_JWT_TOKEN"; // Replace with real token

fetch('https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/refresh-auth-token', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${testToken}`
  }
})
  .then(r => r.json())
  .then(data => console.log('✅ Refresh Success:', data))
  .catch(err => console.error('❌ Refresh Failed:', err));
```

### Files to Copy to AI Studio

Copy these 5 files to your AI Studio project:

1. **src/utils/tokenStorage.ts** - Token persistence
2. **src/services/tokenRefreshClient.ts** - HTTP client for refresh
3. **src/utils/tokenApi.ts** - API client with 401 detection
4. **src/services/backgroundAuthService.ts** - Background service orchestrator
5. **src/hooks/useBackgroundAuth.tsx** - React integration hook

### Configuration Required

After copying files, update `tokenRefreshClient.ts`:

```typescript
// Change this line in tokenRefreshClient.ts:
const REFRESH_ENDPOINT = 'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/refresh-auth-token';
```

### Integration Example

```typescript
// In your main AI Studio component (e.g., pages/Index.tsx):
import { useState, useEffect } from 'react';
import { useBackgroundAuth } from '@/hooks/useBackgroundAuth';
import { saveTokenWithMetadata, clearTokenStorage } from '@/utils/tokenStorage';
import { toast } from 'sonner';

export default function AIStudioPage() {
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
      // Verify token and save it
      verifyAndSaveToken(urlToken);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const verifyAndSaveToken = async (token: string) => {
    try {
      // Simple JWT decode to get expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      
      saveTokenWithMetadata(token, expiresAt);
      setJwtToken(token);
      setIsAuthenticated(true);
      toast.success('Authenticated successfully');
    } catch (error) {
      console.error('Token verification failed:', error);
      toast.error('Invalid authentication token');
    }
  };

  // Integrate background auth service
  useBackgroundAuth({
    isAuthenticated,
    jwtToken,
    onTokenRefreshed: (newToken: string) => {
      console.log('🔄 Token refreshed silently');
      setJwtToken(newToken);
      // Token is already saved by background service
    },
    onAuthLost: () => {
      console.log('🚪 Authentication lost');
      setIsAuthenticated(false);
      setJwtToken(null);
      clearTokenStorage();
      toast.error('Session expired. Redirecting...');
      
      // Redirect back to exhibit3design
      setTimeout(() => {
        window.location.href = 'https://exhibit3design.com/ai-studio-auth';
      }, 2000);
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground">
            Please authenticate via exhibit3design
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Your AI Studio UI here */}
      <h1>AI Studio</h1>
      <p>Authenticated with token: {jwtToken?.substring(0, 20)}...</p>
    </div>
  );
}
```

### What Happens Automatically

Once integrated, the system will:

1. **Every 3 minutes**: Check if token needs refresh (< 10 min remaining)
2. **Automatic Refresh**: Get new token from refresh-auth-token endpoint
3. **Silent Update**: Update token in localStorage and state
4. **Auth Verification**: Call check-ai-tokens to verify user still authenticated
5. **Logout Detection**: Detect 401 responses and trigger onAuthLost callback

### Testing Checklist

- [ ] Token accepted via URL parameter
- [ ] Background service starts automatically
- [ ] Token refreshes before expiration (check browser console)
- [ ] Logout on exhibit3design detected within 3 minutes
- [ ] Network failures handled gracefully
- [ ] Auth lost triggers redirect to exhibit3design

### Monitoring

Enable detailed logging in browser console:
```javascript
// You'll see logs like:
// [BackgroundAuth] Starting background service
// [BackgroundAuth] Token needs refresh (8 min remaining)
// [RefreshToken] Refreshing token...
// [RefreshToken] Token refreshed successfully
```

### Common Issues

**Issue**: "Missing or invalid authorization header"
- **Solution**: Make sure JWT token is being passed in Authorization header

**Issue**: "User account is deactivated"
- **Solution**: Check user status in exhibit3design database

**Issue**: "Server configuration error"
- **Solution**: Verify SHARED_JWT_SECRET is configured in Supabase secrets

**Issue**: Background service not starting
- **Solution**: Ensure isAuthenticated=true and jwtToken is not null

### Support

For issues with token refresh, check:
1. Browser console for detailed logs
2. Supabase Edge Function logs: https://supabase.com/dashboard/project/fipebdkvzdrljwwxccrj/functions/refresh-auth-token/logs
3. Network tab for failed requests
