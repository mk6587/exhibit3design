// Auto-tagging system for products based on description analysis

export interface TagCategory {
  name: string;
  tags: Array<{
    tag: string;
    keywords: string[];
  }>;
}

export const TAG_CATEGORIES: TagCategory[] = [
  {
    name: "Materials",
    tags: [
      { tag: "aluminum", keywords: ["aluminum", "aluminium", "metal", "metallic"] },
      { tag: "wood", keywords: ["wood", "wooden", "timber", "oak", "pine", "birch"] },
      { tag: "fabric", keywords: ["fabric", "textile", "canvas", "cloth"] },
      { tag: "plastic", keywords: ["plastic", "polymer", "acrylic"] },
      { tag: "glass", keywords: ["glass", "tempered", "transparent"] },
      { tag: "steel", keywords: ["steel", "stainless", "iron"] },
      { tag: "composite", keywords: ["composite", "laminate", "engineered"] },
      { tag: "vinyl", keywords: ["vinyl", "PVC", "flexible"] },
      { tag: "leather", keywords: ["leather", "genuine", "synthetic"] },
      { tag: "carbon-fiber", keywords: ["carbon", "fiber", "lightweight"] }
    ]
  },
  {
    name: "Features",
    tags: [
      { tag: "portable", keywords: ["portable", "lightweight", "mobile", "transport", "carry"] },
      { tag: "modular", keywords: ["modular", "customizable", "configurable", "flexible"] },
      { tag: "durable", keywords: ["durable", "strong", "robust", "sturdy", "heavy-duty"] },
      { tag: "waterproof", keywords: ["waterproof", "water-resistant", "weatherproof"] },
      { tag: "adjustable", keywords: ["adjustable", "variable", "adaptable", "height"] },
      { tag: "eco-friendly", keywords: ["eco", "sustainable", "green", "recycled", "biodegradable"] },
      { tag: "easy-assembly", keywords: ["easy", "simple", "quick", "tool-free", "assembly"] },
      { tag: "foldable", keywords: ["foldable", "collapsible", "fold", "compact"] },
      { tag: "illuminated", keywords: ["LED", "light", "illuminated", "bright", "lighting"] },
      { tag: "interactive", keywords: ["interactive", "touch", "digital", "responsive"] }
    ]
  },
  {
    name: "Styles",
    tags: [
      { tag: "modern", keywords: ["modern", "contemporary", "sleek", "minimalist"] },
      { tag: "classic", keywords: ["classic", "traditional", "timeless", "elegant"] },
      { tag: "industrial", keywords: ["industrial", "rugged", "urban", "concrete"] },
      { tag: "luxury", keywords: ["luxury", "premium", "high-end", "sophisticated"] },
      { tag: "minimalist", keywords: ["minimalist", "clean", "simple", "uncluttered"] },
      { tag: "rustic", keywords: ["rustic", "vintage", "weathered", "distressed"] },
      { tag: "futuristic", keywords: ["futuristic", "cutting-edge", "advanced", "high-tech"] },
      { tag: "professional", keywords: ["professional", "business", "corporate", "formal"] },
      { tag: "creative", keywords: ["creative", "artistic", "unique", "innovative"] },
      { tag: "bold", keywords: ["bold", "striking", "eye-catching", "vibrant"] }
    ]
  },
  {
    name: "Use Cases",
    tags: [
      { tag: "trade-show", keywords: ["trade", "show", "exhibition", "expo", "fair"] },
      { tag: "retail", keywords: ["retail", "store", "shop", "display", "commercial"] },
      { tag: "office", keywords: ["office", "workplace", "corporate", "business"] },
      { tag: "outdoor", keywords: ["outdoor", "external", "weather", "patio", "garden"] },
      { tag: "indoor", keywords: ["indoor", "interior", "inside", "hall"] },
      { tag: "conference", keywords: ["conference", "meeting", "seminar", "presentation"] },
      { tag: "event", keywords: ["event", "party", "celebration", "gathering"] },
      { tag: "marketing", keywords: ["marketing", "promotion", "advertising", "brand"] },
      { tag: "educational", keywords: ["educational", "school", "university", "training"] },
      { tag: "hospitality", keywords: ["hospitality", "hotel", "restaurant", "cafe"] }
    ]
  },
  {
    name: "Sizes",
    tags: [
      { tag: "compact", keywords: ["compact", "small", "mini", "space-saving"] },
      { tag: "large", keywords: ["large", "big", "oversized", "spacious"] },
      { tag: "standard", keywords: ["standard", "regular", "normal", "typical"] },
      { tag: "custom-size", keywords: ["custom", "bespoke", "tailored", "made-to-measure"] },
      { tag: "multi-size", keywords: ["multiple", "various", "different", "range"] },
      { tag: "wall-mounted", keywords: ["wall", "mounted", "hanging", "fixed"] },
      { tag: "floor-standing", keywords: ["floor", "standing", "freestanding", "ground"] },
      { tag: "tabletop", keywords: ["tabletop", "desktop", "counter", "surface"] },
      { tag: "ceiling", keywords: ["ceiling", "suspended", "overhead", "hanging"] },
      { tag: "corner", keywords: ["corner", "angled", "L-shaped", "triangular"] }
    ]
  },
  {
    name: "Technologies",
    tags: [
      { tag: "digital", keywords: ["digital", "electronic", "screen", "monitor"] },
      { tag: "print", keywords: ["print", "printed", "graphics", "vinyl"] },
      { tag: "projection", keywords: ["projection", "projector", "beam", "display"] },
      { tag: "smart", keywords: ["smart", "intelligent", "automated", "connected"] },
      { tag: "wireless", keywords: ["wireless", "bluetooth", "wifi", "remote"] },
      { tag: "USB", keywords: ["USB", "charging", "power", "connection"] },
      { tag: "magnetic", keywords: ["magnetic", "magnet", "snap", "attach"] },
      { tag: "touch-screen", keywords: ["touch", "touchscreen", "interactive", "finger"] },
      { tag: "motion-sensor", keywords: ["motion", "sensor", "movement", "detect"] },
      { tag: "app-controlled", keywords: ["app", "smartphone", "mobile", "control"] }
    ]
  },
  {
    name: "Colors",
    tags: [
      { tag: "white", keywords: ["white", "clean", "pure", "bright"] },
      { tag: "black", keywords: ["black", "dark", "charcoal", "midnight"] },
      { tag: "silver", keywords: ["silver", "metallic", "chrome", "brushed"] },
      { tag: "colorful", keywords: ["colorful", "vibrant", "rainbow", "multicolor"] },
      { tag: "neutral", keywords: ["neutral", "beige", "cream", "natural"] },
      { tag: "blue", keywords: ["blue", "navy", "azure", "cobalt"] },
      { tag: "red", keywords: ["red", "crimson", "scarlet", "burgundy"] },
      { tag: "green", keywords: ["green", "emerald", "forest", "lime"] },
      { tag: "custom-color", keywords: ["custom", "branded", "pantone", "color-match"] },
      { tag: "transparent", keywords: ["transparent", "clear", "see-through", "acrylic"] }
    ]
  },
  {
    name: "Special Features",
    tags: [
      { tag: "storage", keywords: ["storage", "compartment", "drawer", "shelf"] },
      { tag: "wheels", keywords: ["wheels", "casters", "mobile", "rolling"] },
      { tag: "lockable", keywords: ["lock", "secure", "key", "safety"] },
      { tag: "weather-resistant", keywords: ["weather", "UV", "fade", "resistant"] },
      { tag: "anti-glare", keywords: ["anti-glare", "matte", "non-reflective"] },
      { tag: "double-sided", keywords: ["double", "two-sided", "back-to-back", "reversible"] },
      { tag: "branded", keywords: ["branded", "logo", "custom", "personalized"] },
      { tag: "accessories", keywords: ["accessories", "extras", "add-ons", "optional"] },
      { tag: "warranty", keywords: ["warranty", "guarantee", "support", "service"] },
      { tag: "installation", keywords: ["installation", "setup", "mounting", "professional"] }
    ]
  }
];

// Flatten all tags for easy access
export const ALL_TAGS = TAG_CATEGORIES.flatMap(category => 
  category.tags.map(tagInfo => tagInfo.tag)
);

// Auto-generate tags based on product description
export function generateTagsFromDescription(description: string, longDescription?: string): string[] {
  const combinedText = `${description} ${longDescription || ""}`.toLowerCase();
  const foundTags: string[] = [];

  // Check each tag's keywords against the combined text
  for (const category of TAG_CATEGORIES) {
    for (const tagInfo of category.tags) {
      // Check if any keyword matches
      const hasMatch = tagInfo.keywords.some(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );
      
      if (hasMatch && !foundTags.includes(tagInfo.tag)) {
        foundTags.push(tagInfo.tag);
      }
    }
  }

  // Sort tags alphabetically and limit to 10 most relevant
  return foundTags.sort().slice(0, 10);
}

// Get tag suggestions for manual selection
export function getTagSuggestions(searchTerm: string): string[] {
  if (!searchTerm) return ALL_TAGS.slice(0, 20);
  
  const lowerSearch = searchTerm.toLowerCase();
  return ALL_TAGS.filter(tag => 
    tag.toLowerCase().includes(lowerSearch)
  ).slice(0, 20);
}

// Get tags by category
export function getTagsByCategory(categoryName: string): string[] {
  const category = TAG_CATEGORIES.find(cat => cat.name === categoryName);
  return category ? category.tags.map(tagInfo => tagInfo.tag) : [];
}