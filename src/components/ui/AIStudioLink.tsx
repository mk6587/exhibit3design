import { ButtonHTMLAttributes } from 'react';
import { navigateToAIStudioWithAuth } from '@/utils/crossDomainAuth';

interface AIStudioLinkProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: React.ReactNode;
  serviceId?: string; // e.g., "rotate-360" or "add-visitors"
}

/**
 * A button component for navigating to AI Studio with session transfer
 * Uses URL-based session transfer to authenticate across domains
 */
export const AIStudioLink = ({ children, className, serviceId, ...props }: AIStudioLinkProps) => {
  const handleClick = async () => {
    await navigateToAIStudioWithAuth(serviceId);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
};
