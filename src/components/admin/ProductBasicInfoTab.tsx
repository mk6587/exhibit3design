
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Sparkles, X } from 'lucide-react';
import AIContentGenerator from './AIContentGenerator';
import { Product } from '@/types/product';
import { generateTagsFromDescription, getTagSuggestions } from '@/utils/autoTags';

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

  const handleAutoGenerateTags = () => {
    const autoTags = generateTagsFromDescription(product.description, product.long_description);
    // Merge with existing tags, avoiding duplicates
    const combinedTags = [...new Set([...product.tags, ...autoTags])];
    onProductChange({...product, tags: combinedTags});
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

  const suggestions = getTagSuggestions(tagInput);

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
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Auto-Generate Tags
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
              placeholder="Type to add tags or search suggestions..."
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyPress={handleTagInputKeyPress}
              onFocus={() => setShowSuggestions(tagInput.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            
            {/* Tag Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                    onClick={() => addTag(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
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
