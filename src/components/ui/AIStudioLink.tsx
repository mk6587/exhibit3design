import { navigateToAIStudio } from '@/utils/aiStudioAuth';
import { AnchorHTMLAttributes } from 'react';

interface AIStudioLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  children: React.ReactNode;
  serviceId?: string; // e.g., "rotate-360" or "add-visitors"
}

/**
 * A link component that automatically handles authentication when navigating to AI Studio
 * Use this for any link that points to ai.exhibit3design.com
 * Supports service parameter for specific services
 */
export const AIStudioLink = ({ children, className, serviceId, ...props }: AIStudioLinkProps) => {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await navigateToAIStudio(serviceId);
  };

  const displayUrl = serviceId 
    ? `https://ai.exhibit3design.com?service=${serviceId}`
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
