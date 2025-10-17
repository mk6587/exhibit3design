import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Mail, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SelectedFile {
  product_id: number;
  product_name: string;
  selected_at: string;
}

export function SelectedFiles() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelectedFiles();
  }, []);

  const loadSelectedFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('selected_files')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setSelectedFiles(Array.isArray(data?.selected_files) ? data.selected_files as unknown as SelectedFile[] : []);
    } catch (error) {
      console.error('Error loading selected files:', error);
      toast.error('Failed to load selected files');
    } finally {
      setLoading(false);
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

  if (selectedFiles.length === 0) {
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
          {selectedFiles.map((file, index) => (
            <Link
              key={index}
              to={`/products/${file.product_id}`}
              className="block p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      {file.product_name || `Design #${file.product_id}`}
                    </h4>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Selected on {format(new Date(file.selected_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}