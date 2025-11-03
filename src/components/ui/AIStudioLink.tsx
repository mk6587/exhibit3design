import { AnchorHTMLAttributes } from 'react';

interface AIStudioLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  children: React.ReactNode;
  serviceId?: string; // e.g., "rotate-360" or "add-visitors"
}

/**
 * A link component for navigating to AI Studio
 * Sessions are automatically shared via cookies across subdomains
 */
export const AIStudioLink = ({ children, className, serviceId, ...props }: AIStudioLinkProps) => {
  const href = serviceId 
    ? `https://ai.exhibit3design.com?service=${serviceId}`
    : 'https://ai.exhibit3design.com';

  return (
    <a
      {...props}
      href={href}
      className={className}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};
