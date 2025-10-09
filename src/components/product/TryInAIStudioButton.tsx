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
      toast.error("Please sign in to use AI Studio");
      navigate("/auth");
      return;
    }

    // Check if user has AI tokens
    const tokensAvailable = profile?.ai_tokens_balance || 0;
    if (tokensAvailable <= 0) {
      toast.error("You don't have enough AI tokens. Please upgrade your plan.");
      navigate("/pricing");
      return;
    }

    // Open AI Studio
    try {
      await openAIStudio(user.id, user.email!);
      toast.success("Opening AI Studio...");
    } catch (error) {
      console.error("Error opening AI Studio:", error);
      toast.error("Failed to open AI Studio. Please try again.");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleTryInAIStudio}
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Try in AI Studio
    </Button>
  );
};
