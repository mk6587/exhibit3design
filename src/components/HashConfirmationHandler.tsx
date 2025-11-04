import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HashConfirmationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    
    // ONLY handle email confirmation redirects, NOT OAuth
    // OAuth tokens (access_token, refresh_token) are handled by Supabase automatically
    if (hash && (hash.includes('type=signup') || hash.includes('token_hash')) && !hash.includes('access_token')) {
      // Redirect to the email confirmation page with the hash intact
      window.location.href = '/confirm-email' + hash;
    }
  }, [navigate]);

  return null; // This component doesn't render anything
}