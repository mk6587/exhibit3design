import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SSOButtonProps {
  targetDomain?: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const SSOButton = ({ 
  targetDomain = "https://designers.exhibit3design.com", 
  label = "Continue to Designers Portal",
  variant = "default" 
}: SSOButtonProps) => {
  const { generateSSOToken, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSSORedirect = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in first to access the designers portal.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error, redirectUrl } = await generateSSOToken(targetDomain);
      
      if (error) {
        toast({
          title: "SSO Error",
          description: error.message || "Failed to generate SSO token. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (redirectUrl) {
        // Open in same window
        window.location.href = redirectUrl;
      }
    } catch (error) {
      toast({
        title: "SSO Error", 
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Don't show SSO button if user is not logged in
  }

  return (
    <Button
      variant={variant}
      onClick={handleSSORedirect}
      disabled={loading}
      className="gap-2"
    >
      <ExternalLink className="h-4 w-4" />
      {loading ? "Redirecting..." : label}
    </Button>
  );
};