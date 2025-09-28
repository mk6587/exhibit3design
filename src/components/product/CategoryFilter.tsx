import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CategoryFilterProps {
  category: {
    key: string;
    name: string;
    tags: string[];
  };
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

export const CategoryFilter = ({ 
  category, 
  selectedTags, 
  onTagToggle 
}: CategoryFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeCount = selectedTags.filter(tag => 
    category.tags.some(categoryTag => categoryTag.toLowerCase() === tag.toLowerCase())
  ).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`justify-between h-10 min-w-[140px] ${
            activeCount > 0 
              ? 'border-primary bg-primary/10 text-primary' 
              : 'border-border bg-background text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            {category.name}
            {activeCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeCount}
              </Badge>
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 max-h-80 overflow-y-auto bg-background border shadow-lg p-0" 
        align="start"
        sideOffset={4}
      >
        <div className="p-3">
          <div className="text-sm font-medium mb-3 text-foreground">
            {category.name}
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {category.tags.length > 0 ? (
              category.tags.map(tag => {
                const isSelected = selectedTags.some(selectedTag => 
                  selectedTag.toLowerCase() === tag.toLowerCase()
                );
                
                return (
                  <div 
                    key={tag} 
                    className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer"
                    onClick={() => onTagToggle(tag)}
                  >
                    <Checkbox 
                      id={`${category.key}-${tag}`}
                      checked={isSelected}
                      onChange={() => onTagToggle(tag)}
                      className="pointer-events-none"
                    />
                    <label 
                      htmlFor={`${category.key}-${tag}`} 
                      className="text-sm font-normal cursor-pointer flex-1 text-foreground"
                    >
                      {tag}
                    </label>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground italic p-2">
                No options available
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};