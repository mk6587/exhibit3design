import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TokenGateBanner = () => {
  const navigate = useNavigate();

  return (
    <Alert className="mb-6 border-warning bg-warning/10">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertDescription className="ml-2">
        <p className="font-medium mb-2">
          To apply, please use at least one AI token. We want you to understand our platform's value before joining our team.
        </p>
        <Button 
          onClick={() => navigate('/ai-samples')}
          variant="default"
          size="sm"
          className="mt-2"
        >
          Try AI Tool Now
        </Button>
      </AlertDescription>
    </Alert>
  );
};
