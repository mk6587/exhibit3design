import { useAuth } from '@/contexts/AuthContext';
import { openAIStudio } from '@/utils/aiStudioAuth';
import { setAuthRedirect } from '@/utils/authRedirect';
import { toast } from 'sonner';
import { AnchorHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';

interface AIStudioLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  children: React.ReactNode;
  queryParams?: string; // e.g., "?service=rotate-360" or "/?service=rotate-360"
}

/**
 * A link component that automatically handles authentication when navigating to AI Studio
 * Use this for any link that points to ai.exhibit3design.com
 * Supports query parameters for specific services
 */
export const AIStudioLink = ({ children, className, queryParams, ...props }: AIStudioLinkProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (!user) {
      // Store the AI Studio URL with query params for post-auth redirect
      const aiStudioUrl = `ai-studio:${queryParams || ''}`;
      setAuthRedirect(aiStudioUrl);
      navigate('/auth');
      return;
    }

    try {
      await openAIStudio(user.id, user.email || '', queryParams);
    } catch (error) {
      console.error('Failed to open AI Studio:', error);
      toast.error('Failed to open AI Studio. Please try again.');
    }
  };

  const displayUrl = queryParams 
    ? `https://ai.exhibit3design.com${queryParams}`
    : 'https://ai.exhibit3design.com';

  return (
    <a
      {...props}
      href={displayUrl}
      onClick={handleClick}
      className={className}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};
