import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock } from "lucide-react";

interface ActivityLog {
  id: string;
  action_type: string;
  action_details: any;
  created_at: string;
  admin_id: string;
}

interface UserActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function UserActivityDialog({ open, onOpenChange, userId }: UserActivityDialogProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadActivities();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Activity Log
          </DialogTitle>
          <DialogDescription>
            Recent actions performed on this user account
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
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
              <p>No activity recorded yet</p>
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
      </DialogContent>
    </Dialog>
  );
}
