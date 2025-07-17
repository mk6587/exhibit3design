import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HashConfirmationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    
    // Check if we have confirmation parameters in the hash
    if (hash && (hash.includes('access_token') || hash.includes('token_hash'))) {
      // Redirect to the email confirmation page with the hash intact
      navigate('/confirm-email' + hash);
    }
  }, [navigate]);

  return null; // This component doesn't render anything
}