import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";
import { Zap, Video } from "lucide-react";

interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  ai_tokens_balance: number;
  ai_tokens_limit: number;
  video_results_balance: number;
}

interface AdjustTokensDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData;
  onUpdate: () => void;
}

export function AdjustTokensDialog({ open, onOpenChange, user, onUpdate }: AdjustTokensDialogProps) {
  const [aiTokens, setAiTokens] = useState(user.ai_tokens_balance.toString());
  const [aiTokensLimit, setAiTokensLimit] = useState(user.ai_tokens_limit?.toString() || "2");
  const [videoResults, setVideoResults] = useState(user.video_results_balance.toString());
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { user: adminUser } = useAdmin();

  const handleSave = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the token adjustment');
      return;
    }

    const aiTokensNum = parseInt(aiTokens);
    const aiTokensLimitNum = parseInt(aiTokensLimit);
    const videoResultsNum = parseInt(videoResults);

    if (isNaN(aiTokensNum) || aiTokensNum < 0) {
      toast.error('Please enter a valid AI tokens amount');
      return;
    }

    if (isNaN(aiTokensLimitNum) || aiTokensLimitNum < 0) {
      toast.error('Please enter a valid AI tokens limit');
      return;
    }

    if (isNaN(videoResultsNum) || videoResultsNum < 0) {
      toast.error('Please enter a valid video results amount');
      return;
    }

    setLoading(true);
    try {
      if (!adminUser) throw new Error('Admin user not found');

      const { data, error } = await supabase.rpc('admin_update_user_tokens', {
        p_user_id: user.user_id,
        p_admin_id: adminUser.id,
        p_ai_tokens: aiTokensNum,
        p_ai_tokens_limit: aiTokensLimitNum,
        p_video_results: videoResultsNum,
        p_reason: reason
      });

      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || 'Failed to update tokens');

      toast.success('User tokens updated successfully');
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Adjust User Tokens</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Modify AI tokens and video results balance for {user.first_name || user.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aiTokens" className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                AI Tokens Balance
              </Label>
              <Input
                id="aiTokens"
                type="number"
                min="0"
                value={aiTokens}
                onChange={(e) => setAiTokens(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Current: {user.ai_tokens_balance}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="aiTokensLimit" className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Monthly Token Limit
              </Label>
              <Input
                id="aiTokensLimit"
                type="number"
                min="0"
                value={aiTokensLimit}
                onChange={(e) => setAiTokensLimit(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Current: {user.ai_tokens_limit || 2}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoResults" className="flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                Video Credits
              </Label>
              <Input
                id="videoResults"
                type="number"
                min="0"
                value={videoResults}
                onChange={(e) => setVideoResults(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Current: {user.video_results_balance}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment *</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Refund for issue, Bonus tokens, Correction, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Updating...' : 'Update Tokens'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
