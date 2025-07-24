import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createMkAdmin } from '@/utils/createAdminUser';

const AdminSetupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    
    try {
      const result = await createMkAdmin();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Admin user 'mkadmin' created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create admin user",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>
            Create the initial admin user for the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Username:</strong> mkadmin</p>
            <p><strong>Email:</strong> mkadmin@example.com</p>
            <p><strong>Password:</strong> 1qaz!QAZ</p>
          </div>
          
          <Button 
            onClick={handleCreateAdmin} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Creating Admin..." : "Create Admin User"}
          </Button>
          
          <div className="text-xs text-muted-foreground">
            <p>This will create both an auth user and admin record.</p>
            <p>You can access this page at: /admin-setup</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetupPage;