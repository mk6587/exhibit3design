import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function HashConfirmationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    
    // Handle email confirmation redirects
    if (hash && (hash.includes('type=signup') || hash.includes('token_hash'))) {
      // Redirect to the email confirmation page with the hash intact
      window.location.href = '/confirm-email' + hash;
      return;
    }

    // Handle OAuth redirects (access_token but not type=signup or token_hash)
    if (hash && hash.includes('access_token') && !hash.includes('type=signup') && !hash.includes('token_hash')) {
      console.log('OAuth redirect detected, processing tokens...');
      
      // Let Supabase process the OAuth tokens from the hash
      // This triggers the onAuthStateChange listener in AuthContext
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('OAuth session established:', session.user.email);
          // Clean up the hash from the URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      });
    }
  }, [navigate]);

  return null; // This component doesn't render anything
}