import { Button } from "@/components/ui/button";
import { useProtectedExternalLink } from "@/hooks/useProtectedExternalLink";
import { ButtonProps } from "@/components/ui/button";

interface ProtectedExternalLinkProps extends ButtonProps {
  href: string;
  children: React.ReactNode;
}

/**
 * A button component that checks authentication before navigating to external links
 * If user is not logged in, redirects to auth page and then to the target URL after login
 */
export const ProtectedExternalLink = ({ 
  href, 
  children, 
  ...buttonProps 
}: ProtectedExternalLinkProps) => {
  const { navigateToProtectedLink } = useProtectedExternalLink();

  return (
    <Button 
      {...buttonProps}
      onClick={() => navigateToProtectedLink(href)}
    >
      {children}
    </Button>
  );
};
