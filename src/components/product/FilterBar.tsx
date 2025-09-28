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
    <div className="space-y-3 mb-4">
      {/* Filter Categories Grid - Compact Layout */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Filter by:
          </span>
          {totalActiveFilters > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground text-xs h-7"
            >
              <X className="h-3 w-3 mr-1" />
              Clear ({totalActiveFilters})
            </Button>
          )}
        </div>
        
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
          {filterCategories.map(category => (
            <CategoryFilter
              key={category.key}
              category={category}
              selectedTags={selectedTags}
              onTagToggle={onTagToggle}
            />
          ))}
        </div>
      </div>

      {/* Active Filters Display - More Compact */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t">
          {selectedTags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1 text-xs h-6 px-2"
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