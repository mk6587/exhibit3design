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
        className={`h-[20px] min-h-[20px] max-h-[20px] px-2 py-0 rounded-full text-xs transition-colors border leading-none ${
          activeCount > 0 || isOpen
            ? 'border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100' 
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
        style={{ height: '20px', minHeight: '20px', maxHeight: '20px', lineHeight: 'normal' }}
      >
        <span className="flex items-center gap-1 leading-none">
          <span className="text-xs leading-none">{category.name}</span>
          {activeCount > 0 && (
            <Badge 
              className="h-[14px] px-1 text-[10px] leading-none bg-orange-500 text-white border-0 min-w-[14px] flex items-center justify-center rounded-full"
              style={{ height: '14px', minHeight: '14px', maxHeight: '14px' }}
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
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-48 max-w-72">
          <div className="p-2">
            <div className="text-xs font-medium mb-1.5 text-gray-900">
              {category.name}
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
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
                <div className="text-xs text-gray-500 italic py-1.5 col-span-2">
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