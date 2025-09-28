import { X } from "lucide-react";
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
    <div className="flex flex-col gap-4 mb-6">
      {/* Filter Categories Row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          Filter by:
        </span>
        
        {filterCategories.map(category => (
          <CategoryFilter
            key={category.key}
            category={category}
            selectedTags={selectedTags}
            onTagToggle={onTagToggle}
          />
        ))}
        
        {totalActiveFilters > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all ({totalActiveFilters})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedTags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1"
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