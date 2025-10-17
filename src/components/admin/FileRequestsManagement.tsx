import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileText, Calendar, User, Download } from "lucide-react";
import { format } from "date-fns";
import { uploadImageToSupabase } from "@/lib/supabaseStorage";

interface FileRequest {
  id: string;
  user_id: string;
  product_id: number;
  product_name: string;
  status: 'pending' | 'uploaded' | 'completed';
  requested_at: string;
  uploaded_file_url?: string;
  uploaded_at?: string;
  admin_notes?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

export function FileRequestsManagement() {
  const [requests, setRequests] = useState<FileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('file_requests')
        .select(`
          *,
          profiles!file_requests_user_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as FileRequest[]);
    } catch (error) {
      console.error('Error loading file requests:', error);
      toast.error('Failed to load file requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (requestId: string, file: File) => {
    setUploadingId(requestId);
    try {
      const fileUrl = await uploadImageToSupabase(file, 'design-files');
      
      if (!fileUrl) {
        throw new Error('Failed to upload file');
      }

      const { error } = await supabase
        .from('file_requests')
        .update({
          uploaded_file_url: fileUrl,
          uploaded_at: new Date().toISOString(),
          status: 'uploaded',
          admin_notes: notes[requestId] || null
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('File uploaded successfully');
      loadRequests();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingId(null);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('file_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Status updated successfully');
      loadRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'uploaded':
        return <Badge className="bg-blue-500">Uploaded</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading file requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Design File Requests
        </CardTitle>
        <CardDescription>
          Manage user design file requests and uploads
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No file requests yet
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">{request.product_name}</h4>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>
                          {request.profiles?.first_name} {request.profiles?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Requested: {format(new Date(request.requested_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>

                    {request.uploaded_at && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        <span>Uploaded: {format(new Date(request.uploaded_at), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Admin notes (optional)"
                      value={notes[request.id] || ''}
                      onChange={(e) => setNotes({ ...notes, [request.id]: e.target.value })}
                      className="min-h-[60px]"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        id={`file-${request.id}`}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(request.id, file);
                        }}
                      />
                      <Button
                        onClick={() => document.getElementById(`file-${request.id}`)?.click()}
                        disabled={uploadingId === request.id}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingId === request.id ? 'Uploading...' : 'Upload Design File'}
                      </Button>
                    </div>
                  </div>
                )}

                {request.uploaded_file_url && (
                  <div className="space-y-2">
                    {request.admin_notes && (
                      <div className="text-sm p-2 bg-muted rounded">
                        <span className="font-medium">Admin Notes:</span> {request.admin_notes}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(request.uploaded_file_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        View File
                      </Button>
                      {request.status === 'uploaded' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'completed')}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
