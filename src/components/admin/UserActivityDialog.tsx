import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Clock, Zap, Image as ImageIcon, Video } from "lucide-react";

interface ActivityLog {
  id: string;
  action_type: string;
  action_details: any;
  created_at: string;
  admin_id: string;
}

interface AIGeneration {
  id: string;
  service_type: string;
  prompt: string;
  tokens_used: number;
  created_at: string;
  output_image_url: string | null;
  input_image_url: string | null;
}

interface UserActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function UserActivityDialog({ open, onOpenChange, userId }: UserActivityDialogProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [aiGenerations, setAiGenerations] = useState<AIGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadActivities();
      loadAIGenerations();
    }
  }, [open, userId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      toast.error('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const loadAIGenerations = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_generation_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAiGenerations(data || []);
    } catch (error: any) {
      toast.error('Failed to load AI usage history');
    } finally {
      setAiLoading(false);
    }
  };

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, { text: string; variant: any }> = {
      'profile_updated': { text: 'Profile Updated', variant: 'default' },
      'tokens_updated': { text: 'Tokens Adjusted', variant: 'default' },
      'subscription_changed': { text: 'Subscription Changed', variant: 'default' },
      'user_activated': { text: 'Account Activated', variant: 'default' },
      'user_deactivated': { text: 'Account Deactivated', variant: 'destructive' },
    };
    return labels[actionType] || { text: actionType, variant: 'secondary' };
  };

  const formatDetails = (actionType: string, details: any) => {
    if (!details) return null;

    switch (actionType) {
      case 'tokens_updated':
        return (
          <div className="text-sm text-muted-foreground mt-1 space-y-1">
            <p>AI Tokens: {details.old_ai_tokens} → {details.new_ai_tokens}</p>
            <p>Video Results: {details.old_video_results} → {details.new_video_results}</p>
            {details.reason && <p className="italic">Reason: {details.reason}</p>}
          </div>
        );
      case 'profile_updated':
        return (
          <div className="text-sm text-muted-foreground mt-1 space-y-1">
            {details.new_first_name !== details.old_first_name && (
              <p>Name: {details.old_first_name} → {details.new_first_name}</p>
            )}
            {details.new_email !== details.old_email && (
              <p>Email: {details.old_email} → {details.new_email}</p>
            )}
          </div>
        );
      case 'subscription_changed':
        return (
          <div className="text-sm text-muted-foreground mt-1 space-y-1">
            <p>Plan: {details.plan_name}</p>
            <p>Tokens granted: {details.tokens_granted}</p>
            <p>Video results: {details.video_results_granted}</p>
          </div>
        );
      case 'user_deactivated':
      case 'user_activated':
        return details.reason ? (
          <p className="text-sm text-muted-foreground mt-1 italic">
            Reason: {details.reason}
          </p>
        ) : null;
      default:
        return null;
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'image_edit':
        return <ImageIcon className="h-4 w-4" />;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Activity & AI Usage
          </DialogTitle>
          <DialogDescription>
            View admin actions and AI token usage history
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="admin-actions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admin-actions" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Admin Actions
            </TabsTrigger>
            <TabsTrigger value="ai-usage" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Usage History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin-actions" className="mt-4">
            <ScrollArea className="max-h-[500px] pr-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No admin activity recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const actionInfo = getActionLabel(activity.action_type);
                    return (
                      <div
                        key={activity.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <Badge variant={actionInfo.variant as any}>
                            {actionInfo.text}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                        
                        {formatDetails(activity.action_type, activity.action_details)}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai-usage" className="mt-4">
            <ScrollArea className="max-h-[500px] pr-4">
              {aiLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ))}
                </div>
              ) : aiGenerations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No AI usage recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiGenerations.map((generation) => (
                    <div
                      key={generation.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getServiceIcon(generation.service_type)}
                          <Badge variant="secondary">
                            {getServiceLabel(generation.service_type)}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {generation.tokens_used} token{generation.tokens_used !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(generation.created_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>

                      {generation.prompt && generation.prompt !== 'AI Generation' && (
                        <div className="text-sm">
                          <p className="font-medium text-foreground mb-2">User Prompt:</p>
                          <div className="bg-muted/50 rounded-md p-3 border">
                            <p className="text-muted-foreground whitespace-pre-wrap break-words">
                              {generation.prompt}
                            </p>
                          </div>
                        </div>
                      )}

                      {generation.output_image_url && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            {generation.input_image_url && (
                              <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Input Image:</p>
                                <a 
                                  href={generation.input_image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block group relative"
                                >
                                  <img 
                                    src={generation.input_image_url} 
                                    alt="Input"
                                    className="w-full h-32 object-cover rounded border group-hover:opacity-90 transition-opacity"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                    <ImageIcon className="h-6 w-6 text-white" />
                                  </div>
                                </a>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Generated Output:</p>
                              <a 
                                href={generation.output_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group relative"
                              >
                                <img 
                                  src={generation.output_image_url} 
                                  alt="Output"
                                  className="w-full h-32 object-cover rounded border group-hover:opacity-90 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                  <ImageIcon className="h-6 w-6 text-white" />
                                </div>
                              </a>
                            </div>
                          </div>
                          <a
                            href={generation.output_image_url}
                            download={`ai-generation-${generation.id}.png`}
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Download Output Image
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
