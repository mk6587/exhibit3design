import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { openAIStudio } from "@/utils/aiStudioAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

  const handleTryInAIStudio = async () => {
    // Check if user is authenticated
    if (!user) {
      toast.error("Please sign in to access AI Studio");
      navigate("/auth");
      return;
    }

    // Check if user has an active premium subscription
    // AI Studio is only available to premium subscribers
    toast.error("AI Studio requires a premium subscription. Choose your plan to get started!");
    navigate("/pricing");
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleTryInAIStudio}
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Get Premium
    </Button>
  );
};
