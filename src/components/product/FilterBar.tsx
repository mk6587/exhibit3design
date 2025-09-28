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
            <Filter className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-600 font-medium">
              Filtrele ({totalActiveFilters})
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClear}
            className="text-gray-500 hover:text-gray-700 text-xs h-6 px-2"
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
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="cursor-pointer bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200 flex items-center gap-1 text-xs h-6 px-2 rounded-full"
              onClick={() => onTagToggle(tag)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};