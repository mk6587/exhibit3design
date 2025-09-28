import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryFilter } from "./CategoryFilter";
import { FilterCategory } from "@/utils/tagMapping";

interface FilterBarProps {
  filterCategories: FilterCategory[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClear: () => void;
}

export const FilterBar = ({ 
  filterCategories, 
  selectedTags, 
  onTagToggle, 
  onClear 
}: FilterBarProps) => {
  const totalActiveFilters = selectedTags.length;

  return (
    <div className="space-y-2 mb-4">
      {/* Compact Filter Header */}
      {totalActiveFilters > 0 && (
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-600 font-medium">
              Filtrele ({totalActiveFilters})
            </span>
          </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClear}
              className="text-gray-500 hover:text-gray-700 text-xs h-5 px-2"
            >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      )}
      
      {/* Filter Chips Row */}
      <div className="flex flex-wrap items-center gap-2">
        {filterCategories.map(category => (
          <CategoryFilter
            key={category.key}
            category={category}
            selectedTags={selectedTags}
            onTagToggle={onTagToggle}
          />
        ))}
      </div>

      {/* Active Filters Chips */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="cursor-pointer bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200 flex items-center gap-0.5 text-xs h-[10px] min-h-[10px] max-h-[10px] px-1 py-0 rounded-full leading-none"
              onClick={() => onTagToggle(tag)}
              style={{ height: '10px', minHeight: '10px', maxHeight: '10px', lineHeight: 'normal' }}
            >
              <span className="text-[8px] leading-none">{tag}</span>
              <X className="h-1.5 w-1.5" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};