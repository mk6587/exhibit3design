
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Sparkles, X, Loader2 } from 'lucide-react';
import AIContentGenerator from './AIContentGenerator';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

interface ProductBasicInfoTabProps {
  product: Product;
  onProductChange: (product: Product) => void;
  onAIContentGenerated: (content: string, field: string) => void;
}

const ProductBasicInfoTab: React.FC<ProductBasicInfoTabProps> = ({
  product,
  onProductChange,
  onAIContentGenerated
}) => {
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const { toast } = useToast();

  const handleAutoGenerateTags = async () => {
    setIsGeneratingTags(true);
    
    try {
      const response = await fetch('https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/generate-filter-tags', {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { generatedTags } = await response.json();
      
      // Extract readable tag names from filter tags for display
      const readableTags = generatedTags.map((tag: string) => {
        if (tag.startsWith('filter:')) {
          return tag.split(':').pop() || tag;
        }
        return tag;
      });
      
      // Merge with existing non-filter tags, avoiding duplicates
      const existingTags = product.tags.filter(tag => !tag.startsWith('filter:'));
      const combinedTags = [...new Set([...existingTags, ...readableTags])];
      
      onProductChange({...product, tags: combinedTags});
      
      toast({
        title: "Tags Generated",
        description: `Generated ${readableTags.length} new tags using Claude Sonnet.`,
      });
      
    } catch (error) {
      console.error('Tag generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate tags. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !product.tags.includes(tag.trim())) {
      onProductChange({...product, tags: [...product.tags, tag.trim()]});
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onProductChange({...product, tags: product.tags.filter(tag => tag !== tagToRemove)});
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // No suggestions needed - using AI generation

  return (
    <div className="space-y-4">
      <AIContentGenerator
        contentType="basic-info"
        onContentGenerated={(content) => onAIContentGenerated(content, 'description')}
        currentContent={product.description}
      />
      
      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Product Title</Label>
          <Input
            id="title"
            value={product.title}
            onChange={(e) => onProductChange({...product, title: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="price">Price (€)</Label>
          <Input
            id="price"
            type="number"
            value={product.price}
            onChange={(e) => onProductChange({...product, price: parseInt(e.target.value)})}
          />
        </div>
        <div>
          <Label htmlFor="short-description">Short Description</Label>
          <Textarea
            id="short-description"
            value={product.description}
            onChange={(e) => onProductChange({...product, description: e.target.value})}
            rows={3}
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="tags">Tags</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoGenerateTags}
              disabled={isGeneratingTags}
              className="flex items-center gap-2"
            >
              {isGeneratingTags ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGeneratingTags ? 'Generating...' : 'Auto-Generate Tags'}
            </Button>
          </div>
          
          {/* Current Tags Display */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Tag Input */}
          <div className="relative">
            <Input
              id="tags"
              placeholder="Type to add tags manually..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            Tags help users find your product. Use the auto-generate button to create tags based on your description.
          </p>
        </div>
        <div>
          <Label htmlFor="file-size">File Size</Label>
          <Input
            id="file-size"
            value={product.file_size}
            onChange={(e) => onProductChange({...product, file_size: e.target.value})}
          />
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg bg-amber-50">
          <Star className="h-5 w-5 text-amber-500" />
          <div className="flex-1">
            <Label htmlFor="featured" className="text-sm font-medium">
              Featured Product
            </Label>
            <p className="text-sm text-gray-600">
              Featured products are displayed on the home page
            </p>
          </div>
          <Switch
            id="featured"
            checked={product.featured || false}
            onCheckedChange={(checked) => onProductChange({...product, featured: checked})}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductBasicInfoTab;
