import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { openAIStudio } from "@/utils/aiStudioAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface TryInAIStudioButtonProps {
  productId: number;
  productTitle: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const TryInAIStudioButton = ({ 
  productId, 
  productTitle,
  variant = "outline",
  size = "default",
  className = ""
}: TryInAIStudioButtonProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user has active subscription
        const { data: subscription } = await supabase
          .rpc('get_active_subscription', { p_user_id: user.id });

        if (subscription && subscription.length > 0) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, productId]);

  const handleTryInAIStudio = async () => {
    // Check if user is authenticated
    if (!user) {
      toast.error("Please sign in to access AI Studio");
      navigate("/auth");
      return;
    }

    if (!hasAccess) {
      toast.error("AI Studio requires a premium subscription. Choose your plan to get started!");
      navigate("/pricing");
      return;
    }

    // User has access - navigate to AI Studio
    toast.success("Opening AI Studio...");
    // TODO: Implement AI Studio navigation
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleTryInAIStudio}
      disabled={loading}
    >
      {loading ? "Checking..." : hasAccess ? "Try in AI Studio" : "Get Premium"}
    </Button>
  );
};
