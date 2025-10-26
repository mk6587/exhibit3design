import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBulkEmailPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSendBulkEmails = async () => {
    if (!confirm('Are you sure you want to send welcome emails to ALL users? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      toast.info('Starting bulk email sending...');
      
      const { data, error } = await supabase.functions.invoke('send-bulk-welcome-emails');

      if (error) {
        console.error('Error sending bulk emails:', error);
        toast.error('Failed to send bulk emails');
        return;
      }

      setResult(data);
      toast.success(`Successfully sent ${data.successful} emails`);
      
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Bulk Welcome Email</h1>
          <p className="text-muted-foreground mt-2">
            Send welcome emails to all existing users on the platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Bulk Welcome Emails
            </CardTitle>
            <CardDescription>
              This will send a welcome email with 2 free AI tokens information to all registered users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action will send emails to ALL users. Make sure you want to do this before proceeding.
                The welcome email includes information about their 2 free AI tokens and links to the AI Studio.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSendBulkEmails}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Sending Emails...' : 'Send Welcome Emails to All Users'}
            </Button>

            {result && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{result.total}</div>
                      <div className="text-sm text-muted-foreground">Total Emails</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-5 w-5" />
                        {result.successful}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Successful</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                        <XCircle className="h-5 w-5" />
                        {result.failed}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
                    </div>
                  </div>

                  {result.results && result.results.length > 0 && (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      <h4 className="font-semibold mb-2">Email Details:</h4>
                      {result.results.map((item: any, index: number) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg flex items-center justify-between ${
                            item.success 
                              ? 'bg-green-50 dark:bg-green-950' 
                              : 'bg-red-50 dark:bg-red-950'
                          }`}
                        >
                          <span className="text-sm font-mono">{item.email}</span>
                          <div className="flex items-center gap-2">
                            {item.success ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span className="text-xs text-red-600 dark:text-red-400">
                                  {item.error}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
