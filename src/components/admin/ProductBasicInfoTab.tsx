
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Star } from 'lucide-react';
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
          <Label htmlFor="price">Price ($)</Label>
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
        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={product.tags.join(', ')}
            onChange={(e) => onProductChange({...product, tags: e.target.value.split(',').map(tag => tag.trim())})}
          />
        </div>
        <div>
          <Label htmlFor="file-size">File Size</Label>
          <Input
            id="file-size"
            value={product.fileSize}
            onChange={(e) => onProductChange({...product, fileSize: e.target.value})}
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
