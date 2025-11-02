import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TokenGateBanner = () => {
  const navigate = useNavigate();

  return (
    <Alert className="mb-6 border-primary/30 bg-primary/5">
      <AlertCircle className="h-4 w-4 text-primary" />
      <AlertDescription className="ml-2">
        <h4 className="font-semibold mb-2 text-foreground">Experience Our Platform First</h4>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Before joining our team, we'd love for you to experience what makes Exhibit3Design special. 
          Try our AI-powered design tools with at least 1 token to see how we're revolutionizing 
          exhibition design through AI-assisted workflows. This helps you understand our innovative 
          approach and ensures we're the right fit for each other.
        </p>
        <p className="text-sm font-medium text-foreground mb-3">
          Once you've explored our AI Studio, you'll unlock the ability to submit your application.
        </p>
        <Button 
          onClick={() => navigate('/ai-samples')}
          variant="default"
          size="sm"
        >
          Explore AI Studio →
        </Button>
      </AlertDescription>
    </Alert>
  );
};
