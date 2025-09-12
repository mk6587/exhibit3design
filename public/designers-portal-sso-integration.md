# Designers Portal SSO Integration Guide

This guide explains how to integrate automatic single sign-on (SSO) with the main Exhibit3Design site.

## Overview

When users are logged into `exhibit3design.com`, they should automatically be logged into `designers.exhibit3design.com` without additional authentication steps.

## Integration Methods

### Method 1: Hidden iFrame Check (Recommended)

Add this JavaScript to your designers portal's main layout or login page:

```html
<script>
async function checkMainSiteLogin() {
  return new Promise((resolve) => {
    // Create hidden iframe to communicate with main site
    const iframe = document.createElement('iframe');
    iframe.src = 'https://exhibit3design.com/sso-bridge.html?autoCheck=true';
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    
    // Listen for response
    const messageHandler = (event) => {
      if (event.origin !== 'https://exhibit3design.com') return;
      if (event.data.type !== 'SSO_AUTO_CHECK_RESULT') return;
      
      window.removeEventListener('message', messageHandler);
      document.body.removeChild(iframe);
      resolve(event.data);
    };
    
    window.addEventListener('message', messageHandler);
    document.body.appendChild(iframe);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      resolve({ authenticated: false, message: 'Timeout' });
    }, 10000);
  });
}

// Auto-check on page load
document.addEventListener('DOMContentLoaded', async function() {
  const loginStatus = await checkMainSiteLogin();
  
  console.log('Main site login status:', loginStatus);
  
  if (loginStatus.authenticated && loginStatus.autoLoginUrl) {
    console.log('Auto-logging in user...');
    window.location.href = loginStatus.autoLoginUrl;
  }
});
</script>
```

### Method 2: Direct API Check

If cross-domain iframe communication doesn't work, use this direct API approach:

```javascript
async function checkMainSiteLoginDirect() {
  try {
    // This requires the user to have a valid session token
    // You would need to implement a way to get this token
    const response = await fetch('https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/sso-status-check', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer USER_ACCESS_TOKEN_HERE', // Need to get this somehow
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to check main site login:', error);
    return { authenticated: false };
  }
}
```

### Method 3: URL Parameter Detection

If a user comes from the main site via SSO, they'll have URL parameters:

```javascript
// Check for SSO parameters in URL
const urlParams = new URLSearchParams(window.location.search);
const ssoToken = urlParams.get('sso_token');
const ssoUser = urlParams.get('sso_user');
const ssoEmail = urlParams.get('sso_email');
const ssoExpires = urlParams.get('sso_expires');

if (ssoToken && ssoUser && ssoEmail && ssoExpires) {
  // Verify token hasn't expired
  const expiresAt = parseInt(ssoExpires) * 1000;
  if (Date.now() < expiresAt) {
    // Auto-login the user with these credentials
    console.log('SSO login detected for:', decodeURIComponent(ssoEmail));
    
    // Implement your login logic here
    // For example, create a session for the user
    autoLoginUser({
      id: ssoUser,
      email: decodeURIComponent(ssoEmail),
      ssoToken: ssoToken
    });
  }
}

function autoLoginUser(userData) {
  // Implement your specific login logic here
  // This could involve:
  // 1. Creating a local session
  // 2. Setting authentication cookies
  // 3. Storing user data in localStorage/sessionStorage
  // 4. Redirecting to the main dashboard
  
  console.log('Auto-logging in user:', userData);
  
  // Example implementation:
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('isAuthenticated', 'true');
  
  // Redirect to main dashboard
  window.location.href = '/dashboard';
}
```

## Integration Steps

1. **Choose your integration method** based on your technical requirements
2. **Add the JavaScript code** to your main layout or login page
3. **Implement the auto-login logic** in your authentication system
4. **Test the integration** by logging into exhibit3design.com and then visiting designers.exhibit3design.com

## Security Notes

- All SSO tokens expire automatically (10 minutes default)
- Tokens are single-use and marked as used after consumption
- Cross-origin communication is restricted to trusted domains
- All sensitive data is encrypted in the database

## Troubleshooting

### Common Issues

1. **Cross-origin blocked**: Ensure your site allows communication with exhibit3design.com
2. **Token expired**: Tokens are short-lived, users need to be actively logged in
3. **No response**: Check browser console for CORS or network errors

### Debug Mode

Add this to enable detailed logging:

```javascript
// Enable debug mode
window.ssoDebug = true;

// This will log all SSO-related events to console
```

## Support

For technical support with SSO integration, contact the Exhibit3Design development team.