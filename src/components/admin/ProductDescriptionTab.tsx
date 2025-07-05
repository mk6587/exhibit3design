
import React from 'react';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import AIContentGenerator from './AIContentGenerator';
import { Product } from '@/types/product';

interface ProductDescriptionTabProps {
  product: Product;
  onProductChange: (product: Product) => void;
  onAIContentGenerated: (content: string, field: string) => void;
}

const ProductDescriptionTab: React.FC<ProductDescriptionTabProps> = ({
  product,
  onProductChange,
  onAIContentGenerated
}) => {
  return (
    <div className="space-y-4">
      <AIContentGenerator
        contentType="description"
        onContentGenerated={(content) => onAIContentGenerated(content, 'longDescription')}
        currentContent={product.long_description}
      />
      
      <div>
        <Label htmlFor="long-description">Detailed Description</Label>
        <RichTextEditor
          value={product.long_description}
          onChange={(value) => onProductChange({...product, long_description: value})}
          placeholder="Enter detailed product description..."
          className="mt-2"
        />
        <p className="text-sm text-gray-600 mt-2">
          Use the rich text editor to format your product description with headings, lists, and styling.
        </p>
      </div>
    </div>
  );
};

export default ProductDescriptionTab;
