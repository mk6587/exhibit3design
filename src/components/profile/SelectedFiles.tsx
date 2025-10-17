import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Mail, Calendar, ExternalLink, Download } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileRequest {
  id: string;
  product_id: number;
  product_name: string;
  status: 'pending' | 'uploaded' | 'completed';
  requested_at: string;
  uploaded_file_url?: string;
  uploaded_at?: string;
  admin_notes?: string;
}

export function SelectedFiles() {
  const [fileRequests, setFileRequests] = useState<FileRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFileRequests();
  }, []);

  const loadFileRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('file_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      setFileRequests((data || []) as FileRequest[]);
    } catch (error) {
      console.error('Error loading file requests:', error);
      toast.error('Failed to load file requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'uploaded':
        return <Badge className="bg-blue-500">Ready to Download</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Downloaded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDownload = async (requestId: string, fileUrl: string) => {
    try {
      window.open(fileUrl, '_blank');
      
      // Mark as completed after download
      await supabase
        .from('file_requests')
        .update({ status: 'completed' })
        .eq('id', requestId);
      
      loadFileRequests();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading selected files...</p>
        </CardContent>
      </Card>
    );
  }

  if (fileRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Selected Design Files
          </CardTitle>
          <CardDescription>
            Files you've selected from your free trial will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            You haven't selected any files yet. Browse our designs and select your free trial file!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Selected Design Files
        </CardTitle>
        <CardDescription>
          Files you've selected will be sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Your selected design files will be sent to your email address within 24 hours.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {fileRequests.map((request) => (
            <div
              key={request.id}
              className="p-4 rounded-lg border bg-muted/50"
            >
              <div className="flex items-center justify-between mb-3">
                <Link
                  to={`/products/${request.product_id}`}
                  className="flex items-center gap-2 flex-1 group"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="font-medium group-hover:text-primary transition-colors">
                    {request.product_name || `Design #${request.product_id}`}
                  </h4>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="h-3 w-3" />
                <span>Requested on {format(new Date(request.requested_at), 'MMM dd, yyyy')}</span>
              </div>

              {request.admin_notes && (
                <div className="text-sm p-2 bg-background rounded mb-3">
                  <span className="font-medium">Note from admin:</span> {request.admin_notes}
                </div>
              )}

              {request.uploaded_file_url && (
                <Button
                  onClick={() => handleDownload(request.id, request.uploaded_file_url!)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Design File
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}