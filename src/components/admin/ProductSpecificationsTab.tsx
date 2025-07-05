
import React from 'react';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import AIContentGenerator from './AIContentGenerator';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  longDescription: string;
  specifications: string;
  images: string[];
  tags: string[];
  fileSize: string;
  featured?: boolean;
}

interface ProductSpecificationsTabProps {
  product: Product;
  onProductChange: (product: Product) => void;
  onAIContentGenerated: (content: string, field: string) => void;
}

const ProductSpecificationsTab: React.FC<ProductSpecificationsTabProps> = ({
  product,
  onProductChange,
  onAIContentGenerated
}) => {
  return (
    <div className="space-y-4">
      <AIContentGenerator
        contentType="specification"
        onContentGenerated={(content) => onAIContentGenerated(content, 'specifications')}
        currentContent={product.specifications}
      />
      
      <div>
        <Label htmlFor="specifications">Specifications</Label>
        <RichTextEditor
          value={product.specifications}
          onChange={(value) => onProductChange({...product, specifications: value})}
          placeholder="Enter product specifications..."
          className="mt-2"
        />
        <p className="text-sm text-gray-600 mt-2">
          Use the rich text editor to format your specifications with headings and lists.
        </p>
      </div>
    </div>
  );
};

export default ProductSpecificationsTab;
