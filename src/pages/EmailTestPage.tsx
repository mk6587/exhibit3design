import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailTestPage = () => {
  const [email, setEmail] = useState('designext.agency@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendTestEmail = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('Sending test email to:', email);
      
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: email
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        setResult({ success: false, error: error.message });
        toast({
          title: "Error",
          description: `Failed to send email: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Email sent successfully:', data);
        setResult({ success: true, data });
        toast({
          title: "Success",
          description: "Test email sent successfully!",
          variant: "default",
        });
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setResult({ success: false, error: err.message });
      toast({
        title: "Error",
        description: `Unexpected error: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Email Test</CardTitle>
          <CardDescription>
            Test the SMTP email functionality by sending a test email from noreply@exhibit3design.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter recipient email"
            />
          </div>
          
          <Button 
            onClick={sendTestEmail} 
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Test Email'}
          </Button>

          {result && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>From:</strong> noreply@exhibit3design.com</p>
            <p><strong>SMTP Server:</strong> mail.exhibit3design.com:465</p>
            <p><strong>Security:</strong> TLS/SSL</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTestPage;