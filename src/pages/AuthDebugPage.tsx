import { AuthDebugPanel } from '@/components/admin/AuthDebugPanel';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AuthDebugPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Authentication Debug</h1>
          <p className="text-muted-foreground">
            This panel helps diagnose authentication issues with the hosted auth service.
          </p>
        </div>

        <AuthDebugPanel />

        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
          <h3 className="font-semibold">Required Auth Service Configuration:</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Cookie name must start with "sb-" (e.g., sb-access-token)</li>
            <li>Cookie must have Domain=.exhibit3design.com (with leading dot)</li>
            <li>Cookie must be Secure, HttpOnly, and SameSite=Lax</li>
            <li>CORS must allow origin: {window.location.origin}</li>
            <li>CORS must allow credentials: true</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
