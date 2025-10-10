import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Zap, Image, Video, Calendar } from "lucide-react";
import { format } from "date-fns";

interface AIGeneration {
  id: string;
  service_type: string;
  prompt: string;
  tokens_used: number;
  created_at: string;
  output_image_url: string;
}

export function UsageHistory() {
  const [aiGenerations, setAiGenerations] = useState<AIGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageHistory();
  }, []);

  const loadUsageHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get AI generation history
      const { data: aiData, error: aiError } = await supabase
        .from('ai_generation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (aiError) throw aiError;
      
      setAiGenerations(aiData || []);

    } catch (error) {
      console.error('Error loading usage history:', error);
      toast.error('Failed to load usage history');
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'image_edit':
        return <Image className="h-4 w-4" />;
      case 'video_generation':
        return <Video className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getServiceLabel = (serviceType: string) => {
    switch (serviceType) {
      case 'image_edit':
        return 'AI Image Edit';
      case 'video_generation':
        return 'AI Video Generation';
      default:
        return serviceType;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading usage history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Token Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI Token Usage History
          </CardTitle>
          <CardDescription>
            Track your AI image edits and video generations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiGenerations.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No AI usage yet</h3>
              <p className="text-muted-foreground">
                Use your free tokens to create AI-powered designs
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Prompt</TableHead>
                    <TableHead>Tokens Used</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aiGenerations.map((generation) => (
                    <TableRow key={generation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getServiceIcon(generation.service_type)}
                          <span className="text-sm font-medium">
                            {getServiceLabel(generation.service_type)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {generation.prompt}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {generation.tokens_used}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {generation.output_image_url && (
                          <img 
                            src={generation.output_image_url} 
                            alt="AI Output"
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(generation.created_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
