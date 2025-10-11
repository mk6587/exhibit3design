import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { handleProtectedExternalLink } from '@/utils/authRedirect';

/**
 * Hook to handle protected external links
 * Returns a function that checks auth status before navigating
 */
export const useProtectedExternalLink = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigateToProtectedLink = (url: string) => {
    handleProtectedExternalLink(
      url,
      !!user,
      () => navigate('/auth')
    );
  };

  return { navigateToProtectedLink, isAuthenticated: !!user };
};
