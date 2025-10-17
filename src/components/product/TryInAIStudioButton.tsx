import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { trackFileSelection, trackButtonClick } from "@/services/ga4Analytics";

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
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [maxFiles, setMaxFiles] = useState(0);
  const [selectedFilesCount, setSelectedFilesCount] = useState(0);
  const [isSelected, setIsSelected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasSubscription(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user has active subscription
        const { data: subscription } = await supabase
          .rpc('get_active_subscription', { p_user_id: user.id }) as any;

        if (subscription && subscription.length > 0) {
          setHasSubscription(true);
          setMaxFiles(subscription[0].max_files || 0);
        } else {
          setHasSubscription(false);
          setMaxFiles(0);
        }

        // Check selected files from profile
        if (profile?.selected_files) {
          const selectedFiles = Array.isArray(profile.selected_files) 
            ? profile.selected_files 
            : [];
          setSelectedFilesCount(selectedFiles.length);
          setIsSelected(selectedFiles.some((file: any) => file.product_id === productId));
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, productId, profile]);

  const handlePickDesign = async () => {
    trackButtonClick('select_design', 'product_card', { product_id: productId, product_name: productTitle });
    
    // Check if user is authenticated
    if (!user) {
      toast.error("Please sign in to select designs");
      navigate("/auth");
      return;
    }

    if (!hasSubscription) {
      toast.error("Please subscribe to a plan to select design files!");
      navigate("/pricing");
      return;
    }

    // Check if already selected
    if (isSelected) {
      toast.info("This design is already in your selected files");
      return;
    }

    // Check file limit
    if (selectedFilesCount >= maxFiles) {
      toast.error(`You've reached your file limit (${maxFiles} files). Upgrade your plan for more!`);
      navigate("/pricing");
      return;
    }

    try {
      // Get current selected files
      const currentFiles = Array.isArray(profile?.selected_files) 
        ? profile.selected_files 
        : [];

      // Add new file
      const updatedFiles = [
        ...currentFiles,
        {
          product_id: productId,
          product_title: productTitle,
          selected_at: new Date().toISOString()
        }
      ];

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ selected_files: updatedFiles })
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh profile to get updated data
      await refreshProfile();

      // Track file selection
      trackFileSelection(productId, productTitle, updatedFiles.length);

      toast.success("Design selected! Download links will be emailed to you.");
      setIsSelected(true);
      setSelectedFilesCount(updatedFiles.length);
    } catch (error) {
      console.error('Error selecting design:', error);
      toast.error("Failed to select design. Please try again.");
    }
  };

  const getButtonLabel = () => {
    if (loading) return "Checking...";
    if (!hasSubscription) return "Get Premium";
    if (isSelected) return "Selected";
    return "Select Design";
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handlePickDesign}
      disabled={loading || isSelected}
    >
      <FileCheck className="mr-2 h-4 w-4" />
      {getButtonLabel()}
    </Button>
  );
};
