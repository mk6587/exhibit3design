
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard, { Product } from "@/components/product/ProductCard";
import { useProducts } from "@/contexts/ProductsContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { trackViewItemList, trackSearch, trackFilterApplied, trackSortChanged, trackFiltersCleared } from "@/services/ga4Analytics";
import { FilterDropdown } from "@/components/product/FilterDropdown";

const ProductsPage = () => {
  const { products } = useProducts();

  // Track view_item_list when products load
  useEffect(() => {
    if (products && products.length > 0) {
      trackViewItemList(products, 'All Exhibition Stands');
    }
  }, [products]);
  const [searchText, setSearchText] = useState("");
  const [activeSearchText, setActiveSearchText] = useState("");
  const [sort, setSort] = useState("latest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Convert products to match ProductCard interface
  const allProducts: Product[] = products.map(product => ({
    id: product.id,
    title: product.title,
    price: product.price,
    image: (product.images[0] && !product.images[0].startsWith('blob:')) 
      ? product.images[0] 
      : "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
    tags: product.tags
  }));

  // Get unique tags from products and organize into categories
  const allTags = Array.from(new Set(allProducts.flatMap(product => product.tags || [])));
  
  const filterCategories = [
    {
      name: "Stand Type",
      tags: allTags.filter(tag => 
        ["Modern", "Corner", "Island", "Minimalist", "Tech", "Luxury", "Premium"].includes(tag)
      )
    },
    {
      name: "Budget Level", 
      tags: allTags.filter(tag => 
        ["Budget", "Economy", "Standard", "Premium", "Luxury"].includes(tag)
      )
    },
    {
      name: "Size/Format",
      tags: allTags.filter(tag => 
        ["Small", "Medium", "Large", "2-sided", "4-sided", "Hanging-banner", "Wooden-green"].includes(tag)
      )
    },
    {
      name: "File Formats",
      tags: allTags.filter(tag => 
        ["SKP", "3DS", "MAX", "PDF", "DWG", "OBJ"].includes(tag)
      )
    }
  ];
  
  // Filter and sort products
  const filteredProducts = allProducts
    .filter(product => {
      // Text search using activeSearchText (only updated on button click)
      const matchesSearch = activeSearchText === "" || 
        product.title.toLowerCase().includes(activeSearchText.toLowerCase());
      
      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => product.tags.includes(tag));
        
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.id - a.id; // Latest by default (assuming higher ID = newer)
    });

  // Handle search button click
  const handleSearch = () => {
    setActiveSearchText(searchText);
    if (searchText.trim()) {
      // Calculate results count after applying the search
      const searchResults = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchText.toLowerCase());
        const matchesTags = selectedTags.length === 0 || 
          selectedTags.some(tag => product.tags.includes(tag));
        return matchesSearch && matchesTags;
      });
      trackSearch(searchText, searchResults.length);
    }
  };

  // Handle Enter key press in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleTagSelect = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag) 
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    
    // Calculate results count after tag change
    const results = allProducts.filter(product => {
      const matchesSearch = activeSearchText === "" || 
        product.title.toLowerCase().includes(activeSearchText.toLowerCase());
      const matchesTags = newSelectedTags.length === 0 || 
        newSelectedTags.some(selectedTag => product.tags.includes(selectedTag));
      return matchesSearch && matchesTags;
    });
    
    // Track filter action
    const action = selectedTags.includes(tag) ? 'removed' : 'added';
    trackFilterApplied('tag', `${action}:${tag}`, results.length);
  };
  
  const clearFilters = () => {
    const previousFiltersCount = selectedTags.length + (activeSearchText ? 1 : 0) + (sort !== "latest" ? 1 : 0);
    
    setSearchText("");
    setActiveSearchText("");
    setSelectedTags([]);
    setSort("latest");
    
    // Track clear filters with all products count (no filters applied)
    trackFiltersCleared(previousFiltersCount, allProducts.length);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Browse Exhibition Stand Designs</h1>
        
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px] flex gap-2">
              <Input
                placeholder="Search designs..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <Select value={sort} onValueChange={(newSort) => {
              setSort(newSort);
              // Track sort change with current filtered results
              trackSortChanged(newSort, filteredProducts.length);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Filter Dropdown */}
          <div className="flex items-center justify-between">
            <FilterDropdown
              filterCategories={filterCategories}
              selectedTags={selectedTags}
              onTagToggle={handleTagSelect}
              onClear={() => {
                setSelectedTags([]);
                trackFiltersCleared(selectedTags.length, allProducts.length);
              }}
            />
            
            {/* Clear all filters button - only show when any filter is active */}
            {(activeSearchText || selectedTags.length > 0 || sort !== "latest") && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all filters
              </Button>
            )}
          </div>
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <h3 className="text-xl font-medium mb-2">No designs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;
