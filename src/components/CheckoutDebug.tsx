import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { initiatePayment } from "@/services/paymentService";
import { supabase } from "@/integrations/supabase/client";

const CheckoutDebug = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testPaymentFlow = async () => {
    setIsProcessing(true);
    setDebugInfo([]);
    
    try {
      addDebugInfo("Starting payment flow test...");
      
      // Test user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        addDebugInfo(`Auth Error: ${authError.message}`);
        return;
      }
      
      if (!user) {
        addDebugInfo("No authenticated user found");
        return;
      }
      
      addDebugInfo(`User authenticated: ${user.email}`);
      
      // Test payment data preparation
      const paymentData = {
        amount: 10.00,
        description: "Test payment for checkout debug",
        customerInfo: {
          firstName: "Test",
          lastName: "User", 
          email: user.email || "test@example.com",
          mobile: "+1234567890",
          address: "123 Test Street",
          postalCode: "12345",
          country: "US",
          city: "Test City",
        },
        orderItems: [{
          id: 1,
          name: "Test Product",
          price: 10.00,
          quantity: 1
        }]
      };
      
      addDebugInfo("Payment data prepared successfully");
      addDebugInfo(`Amount: €${paymentData.amount}`);
      addDebugInfo(`Customer: ${paymentData.customerInfo.firstName} ${paymentData.customerInfo.lastName}`);
      
      // Test payment initiation
      addDebugInfo("Initiating payment...");
      const response = await initiatePayment(paymentData);
      
      if (response.success) {
        addDebugInfo("✅ Payment initiated successfully!");
        addDebugInfo(`Order Number: ${response.orderNumber}`);
        addDebugInfo(`Message: ${response.message}`);
        addDebugInfo("Form should have been submitted and redirect should occur");
        toast.success("Payment test completed successfully!");
      } else {
        addDebugInfo("❌ Payment initiation failed");
      }
      
    } catch (error) {
      addDebugInfo(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Payment test error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Checkout Debug & QA Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testPaymentFlow} 
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Testing Payment Flow..." : "Test Payment Flow"}
        </Button>
        
        {debugInfo.length > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <div className="space-y-1 text-sm font-mono">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-foreground">
                  {info}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>What this test does:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Verifies user authentication</li>
            <li>Creates test payment data</li>
            <li>Tests payment service integration</li>
            <li>Creates order in database</li>
            <li>Submits form to payment gateway</li>
            <li>Validates the complete flow</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutDebug;