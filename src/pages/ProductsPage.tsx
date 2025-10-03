
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard, { Product } from "@/components/product/ProductCard";
import { useProducts } from "@/contexts/ProductsContext";
import { products as staticProducts } from "@/data/products";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { trackViewItemList, trackSearch, trackFilterApplied, trackSortChanged, trackFiltersCleared } from "@/services/ga4Analytics";
import { FilterBar } from "@/components/product/FilterBar";
import { getFilterCategories, doesTagMatch } from "@/utils/tagMapping";

const ProductsPage = () => {
  const { products: contextProducts } = useProducts();
  
  // Use context products if available, otherwise use static products
  const products = contextProducts && contextProducts.length > 0 ? contextProducts : staticProducts;

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
    tags: product.tags || [] // Ensure tags is always an array
  }));

  // Get unique tags from products and organize into categories using the new mapping system
  const allTags = Array.from(new Set(allProducts.flatMap(product => product.tags || [])));
  
  const filterCategories = getFilterCategories(allTags);
  
  // Filter and sort products
  const filteredProducts = allProducts
    .filter(product => {
      // Text search using activeSearchText (only updated on button click)
      const matchesSearch = activeSearchText === "" || 
        product.title.toLowerCase().includes(activeSearchText.toLowerCase());
      
      // Tag filter using smart matching
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(filterTag => 
          product.tags.some(productTag => doesTagMatch(productTag, filterTag))
        );
        
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
          selectedTags.some(filterTag => 
            product.tags.some(productTag => doesTagMatch(productTag, filterTag))
          );
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
        newSelectedTags.some(filterTag => 
          product.tags.some(productTag => doesTagMatch(productTag, filterTag))
        );
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
          
          {/* New Filter Bar */}
          <FilterBar
            filterCategories={filterCategories}
            selectedTags={selectedTags}
            onTagToggle={handleTagSelect}
            onClear={() => {
              setSelectedTags([]);
              trackFiltersCleared(selectedTags.length, allProducts.length);
            }}
          />
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
