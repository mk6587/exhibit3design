# Admin Panel Security Documentation

## Overview
The admin panel has been secured with multiple layers of protection to prevent unauthorized access and brute force attacks.

## Security Features Implemented

### 1. IP Whitelist Protection ✅
**What it does:** Only whitelisted IP addresses can access the admin panel.

**Your current whitelisted IP:** `45.139.227.130`

**How to manage:**
- Go to Admin Panel → Settings → Security
- Add new IP addresses with optional descriptions
- Enable/disable IPs without removing them
- Remove IPs permanently when no longer needed

**Important Notes:**
- Admins from non-whitelisted IPs will be blocked immediately
- Failed login attempts from blocked IPs are logged
- Make sure to add all your trusted IP addresses

### 2. Rate Limiting ✅
**What it does:** Prevents brute force attacks by limiting login attempts.

**Limits:**
- **5 failed attempts per email** in 15 minutes
- **10 failed attempts per IP** in 15 minutes
- **15 minute lockout** after exceeding limits

**How it works:**
- Each failed login attempt is tracked by email and IP
- After reaching the limit, login is blocked for 15 minutes
- Successful logins reset the counter
- Old attempts (>24 hours) are automatically cleaned up

**User Experience:**
- Clear error messages show remaining lockout time
- Separate tracking for email and IP (both must pass)

### 3. Session Timeout ✅
**What it does:** Automatically logs out inactive administrators.

**Settings:**
- **Timeout period:** 30 minutes of inactivity
- **Activity tracking:** Mouse, keyboard, scroll, touch events
- **Check interval:** Every 60 seconds

**How it works:**
- Activity timer resets on any user interaction
- Background checker runs every minute
- Automatic logout if no activity detected
- User must log in again after timeout

### 4. Additional Security
- ✅ **CAPTCHA protection** (Turnstile) on login page
- ✅ **Input validation** using Zod schemas
- ✅ **Server-side admin verification** via RPC functions
- ✅ **Row Level Security (RLS)** on all database tables
- ✅ **No sensitive data logging** in console
- ✅ **Security definer functions** preventing RLS bypass

## Database Tables

### admin_ip_whitelist
Stores whitelisted IP addresses for admin access.

```sql
- ip_address: TEXT (unique)
- description: TEXT
- is_active: BOOLEAN
- created_at, updated_at: TIMESTAMP
```

### admin_login_attempts
Tracks all admin login attempts for rate limiting.

```sql
- email: TEXT
- ip_address: TEXT
- success: BOOLEAN
- attempt_time: TIMESTAMP
```

## Edge Functions

### validate-admin-login
Called before authentication to check:
1. IP whitelist status
2. Rate limit compliance

**Endpoint:** `https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/validate-admin-login`

**Authentication:** Public (no JWT required)

### log-admin-attempt
Logs all login attempts (success/failure) for auditing.

**Endpoint:** `https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/log-admin-attempt`

**Authentication:** Public (no JWT required)

## Login Flow

1. **Pre-validation:**
   - User enters credentials
   - CAPTCHA verification
   - IP whitelist check
   - Rate limit check

2. **Authentication:**
   - Supabase password verification
   - Admin status check

3. **Post-login:**
   - Log successful attempt
   - Start session timeout timer
   - Track user activity

4. **Failed login:**
   - Log failed attempt
   - Increment attempt counter
   - Show appropriate error message
   - Block if rate limit exceeded

## Security Best Practices

### For Administrators:
1. **Use strong passwords** - Minimum 8 characters, mix of types
2. **Don't share credentials** - Each admin should have their own account
3. **Keep IP list updated** - Remove old/unused IP addresses
4. **Monitor failed attempts** - Check for suspicious activity regularly
5. **Log out when done** - Don't leave sessions open

### For System Maintenance:
1. **Regular security audits** - Review IP whitelist quarterly
2. **Monitor edge function logs** - Watch for unusual patterns
3. **Update Postgres regularly** - Apply security patches
4. **Enable leaked password protection** - In Supabase Dashboard
5. **Reduce OTP expiry time** - In Supabase Auth settings

## Monitoring & Alerts

### What to monitor:
- Failed login attempts from unknown IPs
- Rate limit violations
- Multiple failed attempts from same email
- Login attempts outside business hours (if applicable)

### How to check:
```sql
-- Recent failed attempts
SELECT email, ip_address, attempt_time 
FROM admin_login_attempts 
WHERE success = false 
ORDER BY attempt_time DESC 
LIMIT 50;

-- Rate limit violations (last hour)
SELECT email, COUNT(*) as attempts
FROM admin_login_attempts
WHERE success = false 
  AND attempt_time > now() - interval '1 hour'
GROUP BY email
HAVING COUNT(*) >= 5;
```

## Troubleshooting

### "IP not whitelisted" error:
1. Check your current IP address
2. Go to Admin Panel → Security
3. Add your IP to the whitelist
4. Try logging in again

### "Rate limit exceeded" error:
1. Wait for the lockout period (shown in error)
2. Check if you're using the correct password
3. Contact another admin if urgent access needed

### Session timeout too aggressive:
- Current timeout: 30 minutes
- To adjust: Edit `SESSION_TIMEOUT_MS` in `src/contexts/AdminContext.tsx`
- Recommended range: 15-60 minutes

## Future Enhancements

Consider implementing:
- [ ] Two-factor authentication (2FA)
- [ ] Admin activity audit logs
- [ ] Email alerts for suspicious activity
- [ ] IP geolocation tracking
- [ ] Custom session timeout per admin
- [ ] Role-based access control (RBAC)
- [ ] Password rotation requirements

## Support

For security concerns or issues:
1. Check edge function logs in Supabase Dashboard
2. Review database tables for suspicious activity
3. Contact system administrator
4. Review this documentation

---

**Last Updated:** 2025-10-18  
**Security Version:** 1.0
