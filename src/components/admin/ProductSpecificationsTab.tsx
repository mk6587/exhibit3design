
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types/product';

interface ProductSpecificationsTabProps {
  product: Product;
  onProductChange: (product: Product) => void;
  onAIContentGenerated: (content: string, field: string) => void;
}

interface StandSpecifications {
  dimensions: string;
  height: string;
  layout: string;
  lighting: string;
  specifications: {
    infoDesk: boolean;
    storage: boolean;
    screen: boolean;
    kitchen: boolean;
    seatingArea: boolean;
    meetingRoom: boolean;
    hangingBanner: boolean;
  };
}

const ProductSpecificationsTab: React.FC<ProductSpecificationsTabProps> = ({
  product,
  onProductChange
}) => {
  // Parse existing specifications or use defaults
  const parseSpecifications = (specs: string): StandSpecifications => {
    try {
      return JSON.parse(specs);
    } catch {
      return {
        dimensions: '',
        height: '',
        layout: '',
        lighting: '',
        specifications: {
          infoDesk: false,
          storage: false,
          screen: false,
          kitchen: false,
          seatingArea: false,
          meetingRoom: false,
          hangingBanner: false,
        }
      };
    }
  };

  const specifications = parseSpecifications(product.specifications);

  const updateSpecification = (field: keyof Omit<StandSpecifications, 'specifications'>, value: string) => {
    const updatedSpecs = {
      ...specifications,
      [field]: value
    };
    onProductChange({
      ...product,
      specifications: JSON.stringify(updatedSpecs)
    });
  };

  const updateSpecificationItem = (item: keyof StandSpecifications['specifications'], checked: boolean) => {
    const updatedSpecs = {
      ...specifications,
      specifications: {
        ...specifications.specifications,
        [item]: checked
      }
    };
    onProductChange({
      ...product,
      specifications: JSON.stringify(updatedSpecs)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Physical Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dimensions">Dimensions (L x W)</Label>
              <Input
                id="dimensions"
                value={specifications.dimensions}
                onChange={(e) => updateSpecification('dimensions', e.target.value)}
                placeholder="e.g., 6m x 4m"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                value={specifications.height}
                onChange={(e) => updateSpecification('height', e.target.value)}
                placeholder="e.g., 3.5m"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="layout">Layout</Label>
              <Input
                id="layout"
                value={specifications.layout}
                onChange={(e) => updateSpecification('layout', e.target.value)}
                placeholder="2-sided open"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="lighting">Lighting</Label>
              <Input
                id="lighting"
                value={specifications.lighting}
                onChange={(e) => updateSpecification('lighting', e.target.value)}
                placeholder="e.g., LED spotlights, Track lighting"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stand Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="infoDesk"
                checked={specifications.specifications.infoDesk}
                onCheckedChange={(checked) => updateSpecificationItem('infoDesk', checked as boolean)}
              />
              <Label htmlFor="infoDesk">Info desk</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="storage"
                checked={specifications.specifications.storage}
                onCheckedChange={(checked) => updateSpecificationItem('storage', checked as boolean)}
              />
              <Label htmlFor="storage">Storage</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="screen"
                checked={specifications.specifications.screen}
                onCheckedChange={(checked) => updateSpecificationItem('screen', checked as boolean)}
              />
              <Label htmlFor="screen">Screen</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="kitchen"
                checked={specifications.specifications.kitchen}
                onCheckedChange={(checked) => updateSpecificationItem('kitchen', checked as boolean)}
              />
              <Label htmlFor="kitchen">Kitchen</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seatingArea"
                checked={specifications.specifications.seatingArea}
                onCheckedChange={(checked) => updateSpecificationItem('seatingArea', checked as boolean)}
              />
              <Label htmlFor="seatingArea">Seating area</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="meetingRoom"
                checked={specifications.specifications.meetingRoom}
                onCheckedChange={(checked) => updateSpecificationItem('meetingRoom', checked as boolean)}
              />
              <Label htmlFor="meetingRoom">Meeting room</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hangingBanner"
                checked={specifications.specifications.hangingBanner}
                onCheckedChange={(checked) => updateSpecificationItem('hangingBanner', checked as boolean)}
              />
              <Label htmlFor="hangingBanner">Hanging banner</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSpecificationsTab;
