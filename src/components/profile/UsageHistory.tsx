import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Zap, Image, Video, Calendar, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import ImageViewer from "@/components/ui/image-viewer";

interface AIGeneration {
  id: string;
  service_type: string;
  prompt: string;
  tokens_used: number;
  created_at: string;
  output_image_url: string | null;
  input_image_url: string | null;
}

export function UsageHistory() {
  const [aiGenerations, setAiGenerations] = useState<AIGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

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

  const handleViewImages = (inputUrl: string | null, outputUrl: string | null) => {
    const images = [];
    if (inputUrl && !imageLoadErrors.has(inputUrl)) images.push(inputUrl);
    if (outputUrl && !imageLoadErrors.has(outputUrl)) images.push(outputUrl);
    if (images.length === 0) return;
    
    setViewerImages(images);
    setViewerIndex(0);
    setViewerOpen(true);
  };

  const handleImageError = (url: string) => {
    setImageLoadErrors(prev => new Set(prev).add(url));
  };

  const hasValidImage = (inputUrl: string | null, outputUrl: string | null) => {
    return (inputUrl && !imageLoadErrors.has(inputUrl)) || (outputUrl && !imageLoadErrors.has(outputUrl));
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  if (loading) {
    return (
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
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
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
                    <TableHead className="w-[250px]">Preview</TableHead>
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
                        <div className="flex gap-3">
                          {generation.input_image_url && (
                            <div className="flex flex-col gap-1 items-center">
                              <span className="text-[10px] text-muted-foreground font-medium">Input</span>
                              <div 
                                onClick={() => hasValidImage(generation.input_image_url, generation.output_image_url) && handleViewImages(generation.input_image_url, generation.output_image_url)}
                                className={`relative overflow-hidden rounded border w-20 h-20 bg-muted flex items-center justify-center ${hasValidImage(generation.input_image_url, generation.output_image_url) ? 'cursor-pointer group' : 'cursor-default'}`}
                              >
                                {imageLoadErrors.has(generation.input_image_url) ? (
                                  <span className="text-xs text-muted-foreground">No image</span>
                                ) : (
                                  <>
                                    <img 
                                      src={generation.input_image_url} 
                                      alt="Input"
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                      onError={() => handleImageError(generation.input_image_url!)}
                                    />
                                    {hasValidImage(generation.input_image_url, generation.output_image_url) && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye className="h-4 w-4 text-white" />
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          {generation.output_image_url && (
                            <div className="flex flex-col gap-1 items-center">
                              <span className="text-[10px] text-muted-foreground font-medium">Output</span>
                              <div 
                                onClick={() => hasValidImage(generation.input_image_url, generation.output_image_url) && handleViewImages(generation.input_image_url, generation.output_image_url)}
                                className={`relative overflow-hidden rounded border w-20 h-20 bg-muted flex items-center justify-center ${hasValidImage(generation.input_image_url, generation.output_image_url) ? 'cursor-pointer group' : 'cursor-default'}`}
                              >
                                {imageLoadErrors.has(generation.output_image_url) ? (
                                  <span className="text-xs text-muted-foreground">No image</span>
                                ) : (
                                  <>
                                    <img 
                                      src={generation.output_image_url} 
                                      alt="Output"
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                      onError={() => handleImageError(generation.output_image_url!)}
                                    />
                                    {hasValidImage(generation.input_image_url, generation.output_image_url) && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye className="h-4 w-4 text-white" />
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          {!generation.input_image_url && !generation.output_image_url && (
                            <span className="text-xs text-muted-foreground">No preview</span>
                          )}
                        </div>
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

      <ImageViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={viewerImages}
        initialIndex={viewerIndex}
        title="AI Generation Images"
      />
    </div>
  );
}
