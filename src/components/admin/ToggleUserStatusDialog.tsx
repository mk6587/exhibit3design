import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";

interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
}

interface ToggleUserStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData;
  onUpdate: () => void;
}

export function ToggleUserStatusDialog({ open, onOpenChange, user, onUpdate }: ToggleUserStatusDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { user: adminUser } = useAdmin();
  const isActive = user.is_active !== false;
  const newStatus = !isActive;

  const handleConfirm = async () => {
    if (!newStatus && !reason.trim()) {
      toast.error('Please provide a reason for deactivating the user');
      return;
    }

    setLoading(true);
    try {
      if (!adminUser) throw new Error('Admin user not found');

      const { data, error } = await supabase.rpc('admin_toggle_user_status', {
        p_user_id: user.user_id,
        p_admin_id: adminUser.id,
        p_is_active: newStatus,
        p_reason: reason || null
      });

      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || 'Failed to update user status');

      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      onUpdate();
      onOpenChange(false);
      setReason("");
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {newStatus ? 'Activate' : 'Deactivate'} User Account?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              {newStatus 
                ? `Are you sure you want to activate ${user.first_name || user.email}'s account? They will regain access to all features.`
                : `Are you sure you want to deactivate ${user.first_name || user.email}'s account? They will lose access to all features.`
              }
            </p>
            
            {!newStatus && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Deactivation *</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Policy violation, User request, Suspicious activity, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="mt-2"
                />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || (!newStatus && !reason.trim())}
            className={newStatus ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
          >
            {loading ? (newStatus ? 'Activating...' : 'Deactivating...') : (newStatus ? 'Activate' : 'Deactivate')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
