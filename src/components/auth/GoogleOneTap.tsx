import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleOneTapProps {
  clientId: string;
}

const GoogleOneTap = ({ clientId }: GoogleOneTapProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) {
      return;
    }

    // Don't show if user is already authenticated
    if (user) {
      return;
    }

    // Don't show on auth pages
    if (location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/register') {
      return;
    }

    // Don't show if no client ID
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      return;
    }

    // Check if user dismissed One Tap
    const dismissed = localStorage.getItem('google-onetap-dismissed');
    
    if (dismissed || initialized.current) {
      return;
    }

    // Load Google One Tap script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (!window.google || initialized.current) return;
      
      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // User dismissed or closed the One Tap
          localStorage.setItem('google-onetap-dismissed', 'true');
        }
      });
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
      document.body.removeChild(script);
      }
    };
  }, [clientId, user, loading, location.pathname]);

  const handleCredentialResponse = async (response: any) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Google One Tap error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  return null;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google?: any;
  }
}

export default GoogleOneTap;
