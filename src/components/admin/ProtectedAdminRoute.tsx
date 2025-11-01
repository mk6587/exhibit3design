import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { isAuthenticated, isAdmin, adminAgent } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      console.log('🔒 ProtectedAdminRoute - Checking auth:', { isAuthenticated, isAdmin, hasAdminAgent: !!adminAgent });
      
      // Small delay to allow AdminContext to initialize from localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if authenticated (either admin agent or regular admin user)
      if (!isAuthenticated || !isAdmin) {
        console.log('❌ Not authenticated or not admin, redirecting to login');
        const redirectPath = encodeURIComponent(location.pathname);
        navigate(`/admin/login?redirect=${redirectPath}`, { replace: true });
        return;
      }

      console.log('✅ Access granted');
      setIsVerifying(false);
    };

    verifyAccess();
  }, [isAuthenticated, isAdmin, adminAgent, location.pathname, navigate]);

  // Show loading state during verification
  if (isVerifying) {
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

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
