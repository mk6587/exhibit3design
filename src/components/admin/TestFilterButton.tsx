import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { recognizeFiltersFromProduct, generateFilterTags } from "@/utils/filterRecognition";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TestTube } from "lucide-react";

export function TestFilterButton() {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    try {
      setIsTesting(true);
      
      // Get the first product to test
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (error) throw error;
      if (!products || products.length === 0) {
        toast({
          title: "No products found",
          description: "No products available to test",
          variant: "destructive",
        });
        return;
      }

      const product = products[0];
      
      // Generate filter tags
      const filterTags = recognizeFiltersFromProduct(
        product.title,
        product.description || '',
        product.specifications || '',
        product.price
      );
      
      const autoFilterTags = generateFilterTags(filterTags);
      
      console.log('🧪 Test Results:');
      console.log('Product:', product.title);
      console.log('Original tags:', product.tags);
      console.log('Recognized filters:', filterTags);
      console.log('Generated filter tags:', autoFilterTags);
      
      // Combine existing non-filter tags with new filter tags
      const existingTags = product.tags.filter((tag: string) => !tag.startsWith('filter:'));
      const finalTags = [...existingTags, ...autoFilterTags];
      
      console.log('Final tags would be:', finalTags);
      
      toast({
        title: "Test completed",
        description: `Generated ${autoFilterTags.length} filter tags. Check console for details.`,
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test failed",
        description: "Check console for error details",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button 
      onClick={handleTest} 
      disabled={isTesting}
      variant="outline"
      size="sm"
    >
      {isTesting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <TestTube className="mr-2 h-4 w-4" />
      )}
      {isTesting ? 'Testing...' : 'Test Filter Generation'}
    </Button>
  );
}