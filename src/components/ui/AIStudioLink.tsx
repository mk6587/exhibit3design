import { useAuth } from '@/contexts/AuthContext';
import { openAIStudio } from '@/utils/aiStudioAuth';
import { toast } from 'sonner';
import { AnchorHTMLAttributes } from 'react';

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

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (!user) {
      // If not logged in, just open the AI Studio without auth
      const url = queryParams 
        ? `https://ai.exhibit3design.com${queryParams}`
        : 'https://ai.exhibit3design.com';
      window.open(url, '_blank');
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
