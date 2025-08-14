# Captcha Setup Guide

This project uses Cloudflare Turnstile for captcha protection on authentication forms. Here's how to set it up:

## Prerequisites

1. A Cloudflare account
2. Access to your Supabase dashboard

## Step 1: Set up Cloudflare Turnstile

1. Go to [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
2. Sign up for a Cloudflare account if you don't have one
3. Create a new Turnstile site:
   - Add your domain (e.g., `yourdomain.com`)
   - Add your Lovable preview domain (e.g., `yourproject.lovable.app`)
   - Add `localhost` for local development
4. Copy the **Site Key** and **Secret Key**

## Step 2: Configure Supabase

### Set the Secret Key
The `TURNSTILE_SECRET_KEY` has already been added to your Supabase secrets. You can update it with your actual secret key:

1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Navigate to Project Settings > Edge Functions
3. Update the `TURNSTILE_SECRET_KEY` with your actual secret key from Cloudflare

### Enable Captcha in Supabase Auth (Optional)
You can also enable Supabase's built-in captcha protection:

1. Go to Authentication > Settings in your Supabase dashboard
2. Scroll to "Bot and Abuse Protection"
3. Enable "Enable CAPTCHA protection"
4. Select "Turnstile" as the provider
5. Enter your Turnstile secret key

## Step 3: Update Site Key in Code

Update the site key in your application:

1. Open `src/pages/OTPAuthPage.tsx`
2. Replace the test site key on line 18:
   ```typescript
   const TURNSTILE_SITE_KEY = 'your-actual-site-key-here';
   ```

3. Open `src/pages/CheckoutPage.tsx`
4. Replace the test site key on line 33:
   ```typescript
   const TURNSTILE_SITE_KEY = 'your-actual-site-key-here';
   ```

## Test Site Keys (for development)

For testing purposes, you can use these Turnstile test keys:

- **Always passes**: `1x00000000000000000000AA`
- **Always blocks**: `2x00000000000000000000AB`  
- **Always challenges**: `3x00000000000000000000FF`

## How It Works

The captcha integration works as follows:

1. **Frontend**: Captcha widgets are displayed on:
   - OTP Auth page (login/signup)
   - Checkout page (guest users only)
   - Resend code flows

2. **Backend**: Edge functions validate captcha tokens:
   - `send-otp` function validates captcha before sending OTP
   - `verify-otp` function optionally validates captcha (currently optional)

3. **Security**: Captcha helps prevent:
   - Automated bot attacks
   - Spam registrations
   - Abuse of OTP sending

## Customization

You can customize the captcha appearance by modifying the `TurnstileCaptcha` component:

- **Theme**: `light`, `dark`, or `auto`
- **Size**: `normal` or `compact`
- **Styling**: Modify the `className` prop

## Troubleshooting

### Captcha not loading
- Check that your domain is added to Turnstile site configuration
- Verify the site key is correct
- Check browser console for errors

### Captcha failing validation
- Verify the secret key is correct in Supabase
- Check edge function logs in Supabase dashboard
- Ensure the domain matches your Turnstile configuration

### Local development issues
- Add `localhost` to your Turnstile site domains
- Use test site keys for local development
- Consider using ngrok for testing with real domains

## Security Notes

- Never expose your secret key in frontend code
- The site key is public and safe to include in your application
- Captcha tokens are single-use and expire quickly
- Consider implementing additional rate limiting alongside captcha