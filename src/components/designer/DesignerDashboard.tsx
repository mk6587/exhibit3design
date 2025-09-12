import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Upload, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SSOButton } from '@/components/auth/SSOButton';

export const DesignerDashboard = () => {
  const { designerProfile, user } = useAuth();

  if (!designerProfile) {
    return null;
  }

  const getStatusBadge = () => {
    if (!designerProfile.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!designerProfile.is_approved) {
      return <Badge variant="outline">Pending Approval</Badge>;
    }
    return <Badge variant="default">Active Designer</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Designer Dashboard</CardTitle>
              <CardDescription>Manage your design portfolio and sales</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {designerProfile.business_name && (
            <div>
              <h3 className="font-semibold">Business Name</h3>
              <p className="text-muted-foreground">{designerProfile.business_name}</p>
            </div>
          )}
          
          {designerProfile.bio && (
            <div>
              <h3 className="font-semibold">Bio</h3>
              <p className="text-muted-foreground">{designerProfile.bio}</p>
            </div>
          )}

          {designerProfile.specialties && designerProfile.specialties.length > 0 && (
            <div>
              <h3 className="font-semibold">Specialties</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {designerProfile.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold">Commission Rate</h3>
            <p className="text-muted-foreground">{designerProfile.commission_rate}%</p>
          </div>

          {designerProfile.portfolio_url && (
            <div>
              <h3 className="font-semibold">Portfolio</h3>
              <a 
                href={designerProfile.portfolio_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                View Portfolio <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {designerProfile.is_approved && designerProfile.is_active ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
              <SSOButton 
                targetDomain="https://designers.exhibit3design.com"
                label="Open Designer Portal"
                variant="default"
              />
              <p className="text-sm text-muted-foreground text-center">
                Access the full designer portal to manage your designs
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">Upload Designs</h3>
              <p className="text-sm text-muted-foreground text-center">
                Add new exhibition stand designs to your portfolio
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">Sales Analytics</h3>
              <p className="text-sm text-muted-foreground text-center">
                Track your design sales and earnings
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
              <Settings className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">Profile Settings</h3>
              <p className="text-sm text-muted-foreground text-center">
                Update your designer profile and preferences
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            {!designerProfile.is_approved ? (
              <>
                <h3 className="text-lg font-semibold">Application Under Review</h3>
                <p className="text-muted-foreground text-center">
                  Your designer application is being reviewed by our team. 
                  You'll be notified via email once your application is approved.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">Account Inactive</h3>
                <p className="text-muted-foreground text-center">
                  Your designer account is currently inactive. 
                  Please contact support for assistance.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};