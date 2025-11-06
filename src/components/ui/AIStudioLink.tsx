import { HTMLAttributes } from 'react';

interface AIStudioLinkProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  children: React.ReactNode;
  serviceId?: string; // e.g., "rotate-360" or "add-visitors"
}

/**
 * A component for navigating to AI Studio with session transfer
 * Uses URL-based session transfer to authenticate across domains
 */
export const AIStudioLink = ({ children, className, serviceId, ...props }: AIStudioLinkProps) => {
  const handleClick = () => {
    const baseUrl = 'https://ai.exhibit3design.com';
    const url = serviceId ? `${baseUrl}?service=${serviceId}` : baseUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      {...props}
      onClick={handleClick}
      className={className}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};
