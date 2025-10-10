import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SelectFileButtonProps {
  productId: number;
  productName: string;
}

const SelectFileButton = ({ productId, productName }: SelectFileButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const handleSelectFile = async () => {
    if (!user || !profile) {
      toast.error("Please sign in to select a file");
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get current selected files
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('selected_files')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const selectedFiles = (currentProfile?.selected_files as any[]) || [];
      
      // Check if file is already selected
      if (selectedFiles.some((file: any) => file.product_id === productId)) {
        toast.info("You've already selected this file");
        setIsLoading(false);
        return;
      }
      
      // Add new file to selected files
      const newFile = {
        product_id: productId,
        product_name: productName,
        selected_at: new Date().toISOString(),
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          selected_files: [...selectedFiles, newFile] 
        })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      toast.success("File selected successfully!", {
        description: "You can view your selected files in your profile. The file will be sent to your email shortly."
      });
      
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
      
    } catch (error) {
      console.error('Error selecting file:', error);
      toast.error("Failed to select file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleSelectFile} 
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Selecting...
        </>
      ) : (
        <>
          <FileCheck className="mr-2 h-4 w-4" />
          Select This File
        </>
      )}
    </Button>
  );
};

export default SelectFileButton;