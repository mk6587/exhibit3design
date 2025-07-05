
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
  floor: string;
  powerSupply: string;
  lighting: string;
  facilities: {
    infoDesk: boolean;
    vipRoom: boolean;
    storage: boolean;
    meetingArea: boolean;
    productDisplay: boolean;
    reception: boolean;
    kitchenette: boolean;
    multimedia: boolean;
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
        floor: '',
        powerSupply: '',
        lighting: '',
        facilities: {
          infoDesk: false,
          vipRoom: false,
          storage: false,
          meetingArea: false,
          productDisplay: false,
          reception: false,
          kitchenette: false,
          multimedia: false,
        }
      };
    }
  };

  const specifications = parseSpecifications(product.specifications);

  const updateSpecification = (field: keyof Omit<StandSpecifications, 'facilities'>, value: string) => {
    const updatedSpecs = {
      ...specifications,
      [field]: value
    };
    onProductChange({
      ...product,
      specifications: JSON.stringify(updatedSpecs)
    });
  };

  const updateFacility = (facility: keyof StandSpecifications['facilities'], checked: boolean) => {
    const updatedSpecs = {
      ...specifications,
      facilities: {
        ...specifications.facilities,
        [facility]: checked
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
              <Label htmlFor="floor">Floor Type</Label>
              <Input
                id="floor"
                value={specifications.floor}
                onChange={(e) => updateSpecification('floor', e.target.value)}
                placeholder="e.g., Carpet, Wood, Tiles"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="powerSupply">Power Supply</Label>
              <Input
                id="powerSupply"
                value={specifications.powerSupply}
                onChange={(e) => updateSpecification('powerSupply', e.target.value)}
                placeholder="e.g., 220V, 5kW"
                className="mt-1"
              />
            </div>
            
            <div className="md:col-span-2">
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
          <CardTitle>Stand Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(specifications.facilities).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => updateFacility(key as keyof StandSpecifications['facilities'], checked as boolean)}
                />
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSpecificationsTab;
