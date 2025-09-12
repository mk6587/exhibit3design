import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { DesignerSignup } from '@/components/designer/DesignerSignup';
import { DesignerDashboard } from '@/components/designer/DesignerDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DesignerPage = () => {
  const { user, designerProfile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Layout
        title="Designer Portal - Exhibit3Design"
        description="Join our designer community and sell your exhibition stand designs"
        keywords="designer portal, exhibition design, sell designs, design marketplace"
      >
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout
        title="Designer Portal - Exhibit3Design"
        description="Join our designer community and sell your exhibition stand designs"
        keywords="designer portal, exhibition design, sell designs, design marketplace"
      >
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <h2 className="text-2xl font-bold text-center">Authentication Required</h2>
              <p className="text-muted-foreground text-center">
                Please log in to access the designer portal.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Designer Portal - Exhibit3Design"
      description="Join our designer community and sell your exhibition stand designs"
      keywords="designer portal, exhibition design, sell designs, design marketplace"
    >
      <div className="container mx-auto px-4 py-12">
        {designerProfile ? (
          <DesignerDashboard />
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Join Our Designer Community</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Showcase your exhibition stand designs, reach a global audience, 
                and earn commission on every sale.
              </p>
            </div>
            <DesignerSignup />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DesignerPage;