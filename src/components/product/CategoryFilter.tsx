import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activeCount = selectedTags.filter(tag => 
    category.tags.some(categoryTag => categoryTag.toLowerCase() === tag.toLowerCase())
  ).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-[30px] min-h-[30px] max-h-[30px] px-2 py-0 rounded-full text-sm transition-colors border leading-none ${
          activeCount > 0 || isOpen
            ? 'border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100' 
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
        style={{ height: '30px', minHeight: '30px', maxHeight: '30px', lineHeight: 'normal' }}
      >
        <span className="flex items-center gap-1 leading-none">
          <span className="text-sm leading-none">{category.name}</span>
          {activeCount > 0 && (
            <Badge 
              className="h-[18px] px-1 text-[11px] leading-none bg-purple-500 text-white border-0 min-w-[18px] flex items-center justify-center rounded-full"
              style={{ height: '18px', minHeight: '18px', maxHeight: '18px' }}
            >
              {activeCount}
            </Badge>
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="h-2.5 w-2.5 ml-0.5 opacity-60" />
        ) : (
          <ChevronDown className="h-2.5 w-2.5 ml-0.5 opacity-60" />
        )}
      </Button>

      {/* Dropdown Content - Positioned below the button */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-56 w-max max-w-80">
          <div className="p-2">
            <div className="text-xs font-medium mb-1.5 text-gray-900">
              {category.name}
            </div>
            
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {category.tags.length > 0 ? (
                category.tags.map(tag => {
                  const isSelected = selectedTags.some(selectedTag => 
                    selectedTag.toLowerCase() === tag.toLowerCase()
                  );
                  
                  return (
                    <label 
                      key={tag} 
                      className="flex items-center space-x-1.5 py-0.5 cursor-pointer hover:bg-gray-50 rounded px-1"
                    >
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => onTagToggle(tag)}
                        className="h-3 w-3"
                      />
                      <span className="text-xs text-gray-700 flex-1">
                        {tag}
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="text-xs text-gray-500 italic py-1.5">
                  No options available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};