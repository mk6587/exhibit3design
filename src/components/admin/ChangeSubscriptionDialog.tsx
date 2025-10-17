import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";
import { Crown } from "lucide-react";

interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  initial_ai_tokens: number;
  video_results: number;
}

interface ChangeSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData;
  onUpdate: () => void;
}

export function ChangeSubscriptionDialog({ open, onOpenChange, user, onUpdate }: ChangeSubscriptionDialogProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { user: adminUser } = useAdmin();

  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, price, initial_ai_tokens, video_results')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast.error('Failed to load subscription plans');
    }
  };

  const handleSave = async () => {
    if (!selectedPlan) {
      toast.error('Please select a subscription plan');
      return;
    }

    setLoading(true);
    try {
      if (!adminUser) throw new Error('Admin user not found');

      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) throw new Error('Plan not found');

      // Create subscription
      const { data, error } = await supabase.rpc('create_subscription_for_user', {
        p_user_id: user.user_id,
        p_plan_id: selectedPlan,
        p_period_days: 30
      });

      if (error) throw error;
      if (!data?.[0]?.success) throw new Error(data?.[0]?.message || 'Failed to create subscription');

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_user_id: user.user_id,
        p_admin_id: adminUser.id,
        p_action_type: 'subscription_changed',
        p_action_details: {
          plan_name: plan.name,
          plan_id: selectedPlan,
          tokens_granted: plan.initial_ai_tokens,
          video_results_granted: plan.video_results
        }
      });

      toast.success(`Subscription plan changed to ${plan.name}`);
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to change subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Change Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Assign a new subscription plan to {user.first_name || user.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Select Subscription Plan</Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan..." />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{plan.name}</span>
                      <span className="text-muted-foreground text-sm ml-4">
                        ${plan.price}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlan && (
            <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
              <p className="font-medium">Plan Details:</p>
              {plans.find(p => p.id === selectedPlan) && (
                <>
                  <p className="text-muted-foreground">
                    • AI Tokens: {plans.find(p => p.id === selectedPlan)?.initial_ai_tokens}
                  </p>
                  <p className="text-muted-foreground">
                    • Video Results: {plans.find(p => p.id === selectedPlan)?.video_results}
                  </p>
                  <p className="text-muted-foreground">
                    • Duration: 30 days
                  </p>
                </>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !selectedPlan}>
            {loading ? 'Assigning...' : 'Assign Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
