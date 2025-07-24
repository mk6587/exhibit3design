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
      
      // Generate filter tags using AI
      const aiResponse = await fetch('https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/generate-filter-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcGViZGt2emRybGp3d3hjY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjczMTAsImV4cCI6MjA2NzMwMzMxMH0.N_48R70OWvLsf5INnGiswao__kjUW6ybYdnPIRm0owk`
        },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          longDescription: product.long_description,
          specifications: product.specifications,
          price: product.price
        })
      });
      
      const { filterTags, generatedTags } = await aiResponse.json();
      
      console.log('🧪 Test Results:');
      console.log('Product:', product.title);
      console.log('Original tags:', product.tags);
      console.log('AI Filter Analysis:', filterTags);
      console.log('Generated filter tags:', generatedTags);
      
      // Combine existing non-filter tags with new filter tags
      const existingTags = product.tags.filter((tag: string) => !tag.startsWith('filter:'));
      const finalTags = [...existingTags, ...generatedTags];
      
      console.log('Final tags would be:', finalTags);
      
      toast({
        title: "Test completed",
        description: `Generated ${generatedTags.length} filter tags. Check console for details.`,
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