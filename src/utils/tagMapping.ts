export interface TagMapping {
  stand_type: Record<string, string>;
  size: Record<string, string>;
  style: Record<string, string>;
  materials_palette: Record<string, string>;
  features: Record<string, string>;
}

export const TAG_MAPPING: TagMapping = {
  stand_type: {
    "1-sided": "1-sided (inline)",
    "2-sided": "2-sided (corner)",
    "3-sided": "3-sided (peninsula)",
    "3-sided open": "3-sided (peninsula)",
    "4-sided": "4-sided (island)",
    "4-sided open": "4-sided (island)",
    "island": "4-sided (island)",
    "open-space": "open space",
    "open space": "open space",
    "corner": "2-sided (corner)",
    "modern": "modern inline"
  },
  size: {
    "small": "small",
    "medium": "medium", 
    "large": "large"
  },
  style: {
    "modern": "modern",
    "minimal": "minimal",
    "minimalist": "minimal",
    "futuristic": "futuristic",
    "conceptual": "conceptual",
    "innovative": "innovative",
    "economy": "economy",
    "fun": "fun",
    "tech": "futuristic",
    "luxury": "luxury",
    "premium": "luxury"
  },
  materials_palette: {
    "wood": "wood",
    "green": "green",
    "wooden-green": "wood & green"
  },
  features: {
    "hanging-banner": "hanging banner",
    "hanging banner": "hanging banner",
    "curved": "curved",
    "meeting-room": "meeting room",
    "product-showcasing": "product showcasing",
    "graphical": "graphical",
    "innovation": "innovation",
    "interactive": "interactive",
    "brand": "brand showcase"
  }
};

export interface FilterCategory {
  key: keyof TagMapping;
  name: string;
  tags: string[];
}

export const getFilterCategories = (allTags: string[]): FilterCategory[] => {
  const categories: FilterCategory[] = [
    { key: 'stand_type', name: 'Stand Type', tags: [] },
    { key: 'size', name: 'Size', tags: [] },
    { key: 'style', name: 'Style', tags: [] },
    { key: 'materials_palette', name: 'Materials & Palette', tags: [] },
    { key: 'features', name: 'Features', tags: [] }
  ];

  // Map existing tags to categories
  allTags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    
    categories.forEach(category => {
      const mappingForCategory = TAG_MAPPING[category.key];
      
      // Check if tag exists in this category's mapping
      if (mappingForCategory[lowerTag] && !category.tags.includes(mappingForCategory[lowerTag])) {
        category.tags.push(mappingForCategory[lowerTag]);
      }
    });
  });

  // Remove categories with no tags
  return categories.filter(category => category.tags.length > 0);
};

export const getDisplayName = (tag: string): string => {
  const lowerTag = tag.toLowerCase();
  
  // Find the display name from any category
  for (const categoryKey in TAG_MAPPING) {
    const mapping = TAG_MAPPING[categoryKey as keyof TagMapping];
    if (mapping[lowerTag]) {
      return mapping[lowerTag];
    }
  }
  
  // Return original tag if no mapping found
  return tag;
};

export const doesTagMatch = (productTag: string, filterTag: string): boolean => {
  const productTagLower = productTag.toLowerCase();
  const filterTagLower = filterTag.toLowerCase();
  
  // Direct match
  if (productTagLower === filterTagLower) return true;
  
  // Check if they map to the same display name
  const productDisplayName = getDisplayName(productTag).toLowerCase();
  const filterDisplayName = getDisplayName(filterTag).toLowerCase();
  
  return productDisplayName === filterDisplayName;
};