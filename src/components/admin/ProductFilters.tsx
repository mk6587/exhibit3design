import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2 } from 'lucide-react';

export interface FilterConfig {
  standSizes: string[];
  standTypes: string[];
  keyFeatures: string[];
  standStyles: string[];
  priceRange: [number, number];
}

export interface ActiveFilters {
  standSizes: string[];
  standTypes: string[];
  keyFeatures: string[];
  standStyles: string[];
  priceRange: [number, number];
}

interface ProductFiltersProps {
  filterConfig: FilterConfig;
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  onConfigChange: (config: FilterConfig) => void;
}

const defaultFilterConfig: FilterConfig = {
  standSizes: ['Small (3x3m)', 'Medium (6x3m, 6x6m)', 'Large (9x6m+)', 'Custom Size'],
  standTypes: ['Row Stand (1-sided open)', 'Corner Stand (2-sided open)', 'Peninsula Stand (3-sided open)', 'Island Stand (4-sided open)'],
  keyFeatures: ['Hanging Banner', 'Double-Decker', 'Meeting Area', 'Product Display', 'Wall screen', 'Info Desk', 'Storage', 'Seating Area'],
  standStyles: ['Futuristic', 'Modern', 'Minimalist', 'Eco-friendly', 'Luxury', 'Budget-Friendly'],
  priceRange: [1, 100]
};

export const ProductFilters = ({ filterConfig, activeFilters, onFiltersChange, onConfigChange }: ProductFiltersProps) => {
  const [editMode, setEditMode] = useState(false);
  const [newItems, setNewItems] = useState({
    standSizes: '',
    standTypes: '',
    keyFeatures: '',
    standStyles: ''
  });

  const toggleFilter = (category: keyof Omit<ActiveFilters, 'priceRange'>, value: string) => {
    const currentValues = activeFilters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...activeFilters,
      [category]: newValues
    });
  };

  const addCustomItem = (category: keyof Omit<FilterConfig, 'priceRange'>) => {
    const newItem = newItems[category].trim();
    if (newItem && !filterConfig[category].includes(newItem)) {
      onConfigChange({
        ...filterConfig,
        [category]: [...filterConfig[category], newItem]
      });
      setNewItems({ ...newItems, [category]: '' });
    }
  };

  const removeItem = (category: keyof Omit<FilterConfig, 'priceRange'>, item: string) => {
    onConfigChange({
      ...filterConfig,
      [category]: filterConfig[category].filter(i => i !== item)
    });
    
    // Also remove from active filters if it was selected
    const currentActive = activeFilters[category] as string[];
    if (currentActive.includes(item)) {
      onFiltersChange({
        ...activeFilters,
        [category]: currentActive.filter(i => i !== item)
      });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      standSizes: [],
      standTypes: [],
      keyFeatures: [],
      standStyles: [],
      priceRange: filterConfig.priceRange
    });
  };

  const getActiveFilterCount = () => {
    return activeFilters.standSizes.length + 
           activeFilters.standTypes.length + 
           activeFilters.keyFeatures.length + 
           activeFilters.standStyles.length;
  };

  const renderFilterSection = (
    title: string,
    category: keyof Omit<FilterConfig, 'priceRange'>,
    items: string[]
  ) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {editMode && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add new..."
                value={newItems[category]}
                onChange={(e) => setNewItems({ ...newItems, [category]: e.target.value })}
                className="h-8 w-32 text-xs"
                onKeyPress={(e) => e.key === 'Enter' && addCustomItem(category)}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => addCustomItem(category)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${category}-${item}`}
                checked={(activeFilters[category] as string[]).includes(item)}
                onCheckedChange={() => toggleFilter(category, item)}
              />
              <Label 
                htmlFor={`${category}-${item}`} 
                className="text-sm font-normal cursor-pointer"
              >
                {item}
              </Label>
            </div>
            {editMode && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeItem(category, item)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Product Filters</h3>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary">
              {getActiveFilterCount()} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getActiveFilterCount() > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Done' : 'Manage Filters'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {renderFilterSection('Stand Size', 'standSizes', filterConfig.standSizes)}
        {renderFilterSection('Stand Type', 'standTypes', filterConfig.standTypes)}
        {renderFilterSection('Key Features', 'keyFeatures', filterConfig.keyFeatures)}
        {renderFilterSection('Stand Style', 'standStyles', filterConfig.standStyles)}
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Slider
              value={activeFilters.priceRange}
              onValueChange={(value) => onFiltersChange({
                ...activeFilters,
                priceRange: value as [number, number]
              })}
              min={filterConfig.priceRange[0]}
              max={filterConfig.priceRange[1]}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>€{activeFilters.priceRange[0]}</span>
              <span>€{activeFilters.priceRange[1]}</span>
            </div>
            {editMode && (
              <div className="flex items-center gap-2 text-xs">
                <Input
                  type="number"
                  value={filterConfig.priceRange[0]}
                  onChange={(e) => onConfigChange({
                    ...filterConfig,
                    priceRange: [parseInt(e.target.value) || 1, filterConfig.priceRange[1]]
                  })}
                  className="h-7 w-16"
                />
                <span>to</span>
                <Input
                  type="number"
                  value={filterConfig.priceRange[1]}
                  onChange={(e) => onConfigChange({
                    ...filterConfig,
                    priceRange: [filterConfig.priceRange[0], parseInt(e.target.value) || 100]
                  })}
                  className="h-7 w-16"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {[...activeFilters.standSizes, ...activeFilters.standTypes, 
            ...activeFilters.keyFeatures, ...activeFilters.standStyles].map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
              {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  // Find which category this filter belongs to and remove it
                  Object.keys(activeFilters).forEach((category) => {
                    if (category !== 'priceRange') {
                      const filters = activeFilters[category as keyof Omit<ActiveFilters, 'priceRange'>] as string[];
                      if (filters.includes(filter)) {
                        toggleFilter(category as keyof Omit<ActiveFilters, 'priceRange'>, filter);
                      }
                    }
                  });
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export { defaultFilterConfig };