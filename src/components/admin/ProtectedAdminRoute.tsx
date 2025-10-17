import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { isAuthenticated, isAdmin, checkAdminStatus } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // First check: Is user authenticated?
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          // Not authenticated - redirect to login
          const redirectPath = encodeURIComponent(location.pathname);
          navigate(`/admin/login?redirect=${redirectPath}`, { replace: true });
          return;
        }

        // Second check: Is user an admin?
        const adminStatus = await checkAdminStatus(user.id);
        
        if (!adminStatus) {
          // Authenticated but not admin - show 403
          navigate('/403', { replace: true });
          return;
        }

        // All checks passed
        setIsVerifying(false);
      } catch (error) {
        console.error('Error verifying admin access:', error);
        navigate('/admin/login', { replace: true });
      }
    };

    verifyAccess();
  }, [location.pathname, navigate, checkAdminStatus]);

  // Show loading state during verification
  if (isVerifying || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
