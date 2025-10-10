import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

const PaymentErrorPage = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/pricing');
  };

  const handleContactSupport = () => {
    navigate('/contact');
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-orange-600">Payment Error</CardTitle>
              <CardDescription>
                An unexpected error occurred during the payment process.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>What to do:</strong> Please try again or contact our support team for assistance. 
                  We apologize for the inconvenience.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleTryAgain} className="bg-primary hover:bg-primary/90">
                  Try Again
                </Button>
                <Button onClick={handleContactSupport} variant="outline">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentErrorPage;