export interface FilterTags {
  standSize: string[];
  standType: string[];
  keyFeatures: string[];
  standStyle: string[];
}

export interface StandSpecifications {
  dimensions?: string;
  height?: string;
  layout?: string;
  lighting?: string;
  specifications?: {
    infoDesk?: boolean;
    storage?: boolean;
    screen?: boolean;
    kitchen?: boolean;
    seatingArea?: boolean;
    meetingRoom?: boolean;
    hangingBanner?: boolean;
  };
}

// Default filter definitions that can be customized by admins
export const defaultFilterConfig = {
  standSize: ["Small", "Medium", "Large", "Custom Size"],
  standType: ["1 side open", "2-sided open", "3-sided open", "Island", "L-shaped"],
  keyFeatures: ["Hanging Banner", "Double-Decker", "Meeting Area", "Product Display", "Wall Screen", "Info Desk", "Storage", "Seating Area"],
  standStyle: ["Futuristic", "Economy", "Luxury", "Minimal", "Welcoming (open space)", "Curve style"]
};

export function recognizeFiltersFromProduct(
  title: string, 
  description: string, 
  specifications: string, 
  price: number
): FilterTags {
  const filterTags: FilterTags = {
    standSize: [],
    standType: [],
    keyFeatures: [],
    standStyle: []
  };

  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();
  
  // Parse specifications
  let specs: StandSpecifications = {};
  try {
    specs = JSON.parse(specifications || '{}');
  } catch {
    specs = {};
  }

  // Recognize Stand Size
  const dimensions = specs.dimensions?.toLowerCase() || '';
  if (dimensions.includes('3x3') || lowerTitle.includes('3x3') || lowerDesc.includes('small')) {
    filterTags.standSize.push('Small');
  } else if (dimensions.includes('6x6') || dimensions.includes('6x3') || lowerTitle.includes('6x') || lowerDesc.includes('medium')) {
    filterTags.standSize.push('Medium');
  } else if (dimensions.includes('9x') || dimensions.includes('12x') || lowerTitle.includes('large') || lowerDesc.includes('large')) {
    filterTags.standSize.push('Large');
  } else if (dimensions && !filterTags.standSize.length) {
    filterTags.standSize.push('Custom Size');
  }

  // Recognize Stand Type
  if (lowerTitle.includes('row') || lowerDesc.includes('row') || lowerTitle.includes('1-sided') || lowerTitle.includes('1 side')) {
    filterTags.standType.push('1 side open');
  } else if (lowerTitle.includes('corner') || lowerDesc.includes('corner') || lowerTitle.includes('2-sided') || lowerTitle.includes('2 sided')) {
    filterTags.standType.push('2-sided open');
  } else if (lowerTitle.includes('peninsula') || lowerDesc.includes('peninsula') || lowerTitle.includes('3-sided') || lowerTitle.includes('3 sided')) {
    filterTags.standType.push('3-sided open');
  } else if (lowerTitle.includes('island') || lowerDesc.includes('island')) {
    filterTags.standType.push('Island');
  } else if (lowerTitle.includes('l-shaped') || lowerDesc.includes('l-shaped') || lowerTitle.includes('l shaped')) {
    filterTags.standType.push('L-shaped');
  }

  // Recognize Key Features from specifications
  if (specs.specifications?.hangingBanner || lowerTitle.includes('banner') || lowerDesc.includes('hanging banner')) {
    filterTags.keyFeatures.push('Hanging Banner');
  }
  if (lowerTitle.includes('double-decker') || lowerDesc.includes('double-decker') || lowerTitle.includes('two story')) {
    filterTags.keyFeatures.push('Double-Decker');
  }
  if (specs.specifications?.meetingRoom || lowerTitle.includes('meeting') || lowerDesc.includes('meeting')) {
    filterTags.keyFeatures.push('Meeting Area');
  }
  if (lowerTitle.includes('product display') || lowerDesc.includes('display area') || lowerDesc.includes('showcase')) {
    filterTags.keyFeatures.push('Product Display');
  }
  if (specs.specifications?.screen || lowerTitle.includes('screen') || lowerDesc.includes('wall screen')) {
    filterTags.keyFeatures.push('Wall Screen');
  }
  if (specs.specifications?.infoDesk || lowerTitle.includes('info desk') || lowerDesc.includes('reception')) {
    filterTags.keyFeatures.push('Info Desk');
  }
  if (specs.specifications?.storage || lowerTitle.includes('storage') || lowerDesc.includes('storage')) {
    filterTags.keyFeatures.push('Storage');
  }
  if (specs.specifications?.seatingArea || lowerTitle.includes('seating') || lowerDesc.includes('chairs')) {
    filterTags.keyFeatures.push('Seating Area');
  }

  // Recognize Stand Style
  if (lowerTitle.includes('futuristic') || lowerDesc.includes('futuristic') || lowerDesc.includes('high-tech')) {
    filterTags.standStyle.push('Futuristic');
  }
  if (price < 50 || lowerTitle.includes('budget') || lowerDesc.includes('affordable') || lowerTitle.includes('economy') || lowerDesc.includes('economy')) {
    filterTags.standStyle.push('Economy');
  }
  if (lowerTitle.includes('luxury') || lowerDesc.includes('luxury') || lowerDesc.includes('premium')) {
    filterTags.standStyle.push('Luxury');
  }
  if (lowerTitle.includes('minimal') || lowerDesc.includes('minimal') || lowerDesc.includes('clean')) {
    filterTags.standStyle.push('Minimal');
  }
  if (lowerTitle.includes('welcoming') || lowerDesc.includes('welcoming') || lowerTitle.includes('open space') || lowerDesc.includes('open space')) {
    filterTags.standStyle.push('Welcoming (open space)');
  }
  if (lowerTitle.includes('curve') || lowerDesc.includes('curve') || lowerTitle.includes('curved') || lowerDesc.includes('curved')) {
    filterTags.standStyle.push('Curve style');
  }

  return filterTags;
}

export function generateFilterTags(filterTags: FilterTags): string[] {
  const tags: string[] = [];
  
  // Add filter prefix to distinguish from regular tags
  filterTags.standSize.forEach(size => tags.push(`filter:size:${size}`));
  filterTags.standType.forEach(type => tags.push(`filter:type:${type}`));
  filterTags.keyFeatures.forEach(feature => tags.push(`filter:feature:${feature}`));
  filterTags.standStyle.forEach(style => tags.push(`filter:style:${style}`));
  
  return tags;
}

export function extractFiltersFromTags(tags: string[]): FilterTags {
  const filterTags: FilterTags = {
    standSize: [],
    standType: [],
    keyFeatures: [],
    standStyle: []
  };

  tags.forEach(tag => {
    if (tag.startsWith('filter:size:')) {
      filterTags.standSize.push(tag.replace('filter:size:', ''));
    } else if (tag.startsWith('filter:type:')) {
      filterTags.standType.push(tag.replace('filter:type:', ''));
    } else if (tag.startsWith('filter:feature:')) {
      filterTags.keyFeatures.push(tag.replace('filter:feature:', ''));
    } else if (tag.startsWith('filter:style:')) {
      filterTags.standStyle.push(tag.replace('filter:style:', ''));
    }
  });

  return filterTags;
}