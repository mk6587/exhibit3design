# Authentication Architecture

## Centralized Hosted Auth

This application uses **centralized authentication** hosted at `https://auth.exhibit3design.com`.

All authentication logic has been removed from this codebase. The app functions as a client to the centralized auth service.

## How It Works

### Login Flow
- User clicks "Login / Register" button
- User is redirected to: `https://auth.exhibit3design.com/signin?return_to=<current_page>`
- After successful Google/OTP login, user returns to the original page
- Session is automatically available via shared HttpOnly cookie on `.exhibit3design.com`

### Logout Flow
- User clicks "Logout" button
- Form POST to: `https://auth.exhibit3design.com/logout?return_to=https://exhibit3design.com`
- Clears the shared session cookie across all subdomains

### Session Check (Optional)
- To display user info or check login status, call:
  ```typescript
  const response = await fetch('https://auth.exhibit3design.com/api/session', {
    method: 'GET',
    credentials: 'include'
  });
  const data = await response.json(); // { user } or null
  ```

## Key Files

- `src/contexts/SessionContext.tsx` - Minimal session state management
- `src/components/layout/Header.tsx` - Login/Logout button handlers

## What Was Removed

- ❌ Local Supabase auth clients and SDKs
- ❌ `AuthContext`, `OTPAuthContext`, `AdminContext`
- ❌ Google One Tap component and GSI script
- ❌ Local auth pages (`/auth`, `/login`, `/confirm-email`)
- ❌ Auth utility files (`authRedirect`, `crossDomainAuth`, `tokenStorage`)

## Benefits

✅ **Consistent auth** across all Exhibit3Design domains  
✅ **Secure HttpOnly cookies** shared on `.exhibit3design.com`  
✅ **Simple codebase** with zero local auth complexity  
✅ **Single source of truth** for user sessions
