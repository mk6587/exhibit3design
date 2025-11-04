import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HashConfirmationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    
    // Only handle email confirmation redirects
    // OAuth tokens are automatically processed by Supabase client on initialization
    if (hash && (hash.includes('type=signup') || hash.includes('token_hash'))) {
      // Redirect to the email confirmation page with the hash intact
      window.location.href = '/confirm-email' + hash;
    }
  }, [navigate]);

  return null; // This component doesn't render anything
}