import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { migrateExistingProducts } from "@/utils/migrateProductFilters";
import { Loader2, RefreshCw } from "lucide-react";

export function MigrateFiltersButton() {
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();

  const handleMigrate = async () => {
    try {
      setIsMigrating(true);
      await migrateExistingProducts();
      
      toast({
        title: "Success",
        description: "All products have been updated with filter tags",
      });
      
      // Refresh the page to see the changes
      window.location.reload();
      
    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: "Error",
        description: "Failed to migrate product filters",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Button 
      onClick={handleMigrate} 
      disabled={isMigrating}
      variant="outline"
      size="sm"
    >
      {isMigrating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      {isMigrating ? 'Migrating...' : 'Update Filter Tags'}
    </Button>
  );
}