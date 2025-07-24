// Auto-tagging system for products based on description analysis

export interface TagCategory {
  name: string;
  tags: Array<{
    tag: string;
    keywords: string[];
  }>;
}

// Only use filter categories - no additional auto-generated tags
export const TAG_CATEGORIES: TagCategory[] = [];

// Flatten all tags for easy access
export const ALL_TAGS = TAG_CATEGORIES.flatMap(category => 
  category.tags.map(tagInfo => tagInfo.tag)
);

// Auto-generate tags based on product description
// Note: Only filter tags are generated, no additional tags
export function generateTagsFromDescription(description: string, longDescription?: string): string[] {
  // Return empty array since we only use filter tags now
  // Filter tags are automatically generated in the product update/create process
  return [];
}

// Get tag suggestions for manual selection
// Note: No manual tag suggestions - only filter tags are used
export function getTagSuggestions(searchTerm: string): string[] {
  return [];
}

// Get tags by category
export function getTagsByCategory(categoryName: string): string[] {
  const category = TAG_CATEGORIES.find(cat => cat.name === categoryName);
  return category ? category.tags.map(tagInfo => tagInfo.tag) : [];
}