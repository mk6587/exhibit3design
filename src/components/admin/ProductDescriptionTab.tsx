
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
        currentContent={product.longDescription}
      />
      
      <div>
        <Label htmlFor="long-description">Detailed Description</Label>
        <RichTextEditor
          value={product.longDescription}
          onChange={(value) => onProductChange({...product, longDescription: value})}
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
