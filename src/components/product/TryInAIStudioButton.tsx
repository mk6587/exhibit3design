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

        // Check if this file was already requested
        const { data: existingRequest } = await supabase
          .from('file_requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();

        setIsSelected(!!existingRequest);

        // Count total file requests
        const { count } = await supabase
          .from('file_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setSelectedFilesCount(count || 0);
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
    trackButtonClick('pick_design', 'Product Detail', { product_id: productId });
    
    if (!user) {
      toast.error("Please log in to select a design file");
      navigate("/auth");
      return;
    }

    if (!hasSubscription) {
      toast.error("Please subscribe to a plan to select design files!");
      navigate("/pricing");
      return;
    }

    try {
      // Check if user has already requested this file
      const { data: existingRequest } = await supabase
        .from('file_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingRequest) {
        toast.error("You've already requested this design");
        return;
      }

      // Check file limit
      const { count } = await supabase
        .from('file_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count && count >= maxFiles) {
        toast.error(`You've reached your file limit (${maxFiles} files). Upgrade your plan for more!`);
        navigate("/pricing");
        return;
      }

      // Create new file request
      const { error } = await supabase
        .from('file_requests')
        .insert({
          user_id: user.id,
          product_id: productId,
          product_name: productTitle,
          status: 'pending'
        });

      if (error) throw error;

      // Track the file selection
      trackFileSelection(productId, productTitle, count || 0, hasSubscription ? 'active' : 'free', maxFiles);

      toast.success("Design requested! Check your profile for updates.");
      setIsSelected(true);
    } catch (error) {
      console.error('Error requesting design:', error);
      toast.error("Failed to request design");
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
