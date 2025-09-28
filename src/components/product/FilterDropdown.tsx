import { useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterCategory {
  name: string;
  tags: string[];
}

interface FilterDropdownProps {
  filterCategories: FilterCategory[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClear: () => void;
}

export const FilterDropdown = ({ 
  filterCategories, 
  selectedTags, 
  onTagToggle, 
  onClear 
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="min-w-[200px] justify-between bg-background"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>
                {selectedTags.length === 0 
                  ? "Filter designs" 
                  : `${selectedTags.length} filter${selectedTags.length > 1 ? 's' : ''}`
                }
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-80 max-h-96 overflow-y-auto bg-background border shadow-lg z-50"
          align="start"
          sideOffset={5}
        >
          <div className="p-3">
            <div className="text-sm font-medium mb-3 text-foreground">
              Filter designs:
            </div>
            
            {/* Selected filters display */}
            {selectedTags.length > 0 && (
              <div className="mb-3 pb-3 border-b">
                <div className="text-xs text-muted-foreground mb-2">Selected:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map(tag => (
                     <Badge 
                       key={tag} 
                       variant="secondary" 
                       className="text-xs cursor-pointer hover:bg-secondary/80"
                       onClick={() => onTagToggle(tag)}
                     >
                       {tag}
                       <X className="h-3 w-3 ml-1" />
                     </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Available filters by category */}
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {filterCategories.map(category => (
                <div key={category.name}>
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    {category.name}
                  </div>
                  <div className="space-y-1">
                    {category.tags.length > 0 ? (
                      category.tags.map(tag => (
                        <div 
                          key={tag} 
                          className="flex items-center space-x-2 p-1 rounded hover:bg-accent cursor-pointer"
                          onClick={() => onTagToggle(tag)}
                        >
                          <Checkbox 
                            id={tag}
                            checked={selectedTags.includes(tag)}
                            onChange={() => onTagToggle(tag)}
                            className="pointer-events-none"
                          />
                          <label 
                            htmlFor={tag} 
                            className="text-sm font-normal cursor-pointer flex-1 text-foreground"
                          >
                            {tag}
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic p-1">
                        No filters available
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Clear filters button - only show when filters are active */}
      {selectedTags.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};