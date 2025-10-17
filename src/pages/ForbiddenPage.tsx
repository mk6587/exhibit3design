import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEO/SEOHead";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="403 - Access Forbidden"
        description="You don't have permission to access this page"
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-bold">Access Forbidden</CardTitle>
            <CardDescription className="text-base">
              You don't have permission to access this page. Admin privileges are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">Why am I seeing this?</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>You're not logged in as an administrator</li>
                <li>Your account doesn't have admin privileges</li>
                <li>Your admin access may have been revoked</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Homepage
              </Button>
              <Button onClick={() => navigate('/admin/login')} variant="outline" className="w-full">
                Admin Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
