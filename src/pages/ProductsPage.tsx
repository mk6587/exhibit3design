
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard, { Product } from "@/components/product/ProductCard";
import { useProducts } from "@/contexts/ProductsContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { extractFiltersFromTags, defaultFilterConfig } from "@/utils/filterRecognition";

const ProductsPage = () => {
  const { products } = useProducts();
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("latest");
  const [selectedFilters, setSelectedFilters] = useState({
    standSize: [] as string[],
    standType: [] as string[],
    keyFeatures: [] as string[],
    standStyle: [] as string[]
  });
  const [priceRange, setPriceRange] = useState([1, 100]);
  
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

  // Get available filter options from all products
  const availableFilters = {
    standSize: Array.from(new Set(allProducts.flatMap(product => 
      extractFiltersFromTags(product.tags).standSize
    ))),
    standType: Array.from(new Set(allProducts.flatMap(product => 
      extractFiltersFromTags(product.tags).standType
    ))),
    keyFeatures: Array.from(new Set(allProducts.flatMap(product => 
      extractFiltersFromTags(product.tags).keyFeatures
    ))),
    standStyle: Array.from(new Set(allProducts.flatMap(product => 
      extractFiltersFromTags(product.tags).standStyle
    )))
  };
  
  // Filter and sort products
  const filteredProducts = allProducts
    .filter(product => {
      // Text search
      const matchesSearch = product.title.toLowerCase().includes(searchText.toLowerCase());
      
      // Price range filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Extract filter tags from product
      const productFilters = extractFiltersFromTags(product.tags);
      
      // Filter matching logic
      const matchesStandSize = selectedFilters.standSize.length === 0 || 
        selectedFilters.standSize.some(size => productFilters.standSize.includes(size));
        
      const matchesStandType = selectedFilters.standType.length === 0 || 
        selectedFilters.standType.some(type => productFilters.standType.includes(type));
        
      const matchesKeyFeatures = selectedFilters.keyFeatures.length === 0 || 
        selectedFilters.keyFeatures.some(feature => productFilters.keyFeatures.includes(feature));
        
      const matchesStandStyle = selectedFilters.standStyle.length === 0 || 
        selectedFilters.standStyle.some(style => productFilters.standStyle.includes(style));
        
      return matchesSearch && matchesPrice && matchesStandSize && matchesStandType && 
             matchesKeyFeatures && matchesStandStyle;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.id - a.id; // Latest by default (assuming higher ID = newer)
    });
  
  const handleFilterSelect = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value) 
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };
  
  const clearFilters = () => {
    setSearchText("");
    setSelectedFilters({
      standSize: [],
      standType: [],
      keyFeatures: [],
      standStyle: []
    });
    setPriceRange([1, 100]);
    setSort("latest");
  };

  const hasActiveFilters = searchText || 
    Object.values(selectedFilters).some(arr => arr.length > 0) || 
    priceRange[0] !== 1 || priceRange[1] !== 100 || 
    sort !== "latest";
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Browse Exhibition Stand Designs</h1>
        
        {/* Filters */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <Input
                placeholder="Search designs..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={sort} onValueChange={setSort}>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stand Size Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Stand Size</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableFilters.standSize.map(size => (
                  <Badge 
                    key={size}
                    variant={selectedFilters.standSize.includes(size) ? "default" : "outline"}
                    className="cursor-pointer w-full justify-center"
                    onClick={() => handleFilterSelect('standSize', size)}
                  >
                    {size}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {/* Stand Type Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Stand Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableFilters.standType.map(type => (
                  <Badge 
                    key={type}
                    variant={selectedFilters.standType.includes(type) ? "default" : "outline"}
                    className="cursor-pointer w-full justify-center text-xs"
                    onClick={() => handleFilterSelect('standType', type)}
                  >
                    {type}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {/* Key Features Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Key Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableFilters.keyFeatures.map(feature => (
                  <Badge 
                    key={feature}
                    variant={selectedFilters.keyFeatures.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer w-full justify-center text-xs"
                    onClick={() => handleFilterSelect('keyFeatures', feature)}
                  >
                    {feature}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {/* Stand Style Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Stand Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableFilters.standStyle.map(style => (
                  <Badge 
                    key={style}
                    variant={selectedFilters.standStyle.includes(style) ? "default" : "outline"}
                    className="cursor-pointer w-full justify-center text-xs"
                    onClick={() => handleFilterSelect('standStyle', style)}
                  >
                    {style}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Price Range Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Price Range: €{priceRange[0]} - €{priceRange[1]}</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={500}
                min={1}
                step={1}
                className="w-full"
              />
            </CardContent>
          </Card>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all filters
            </Button>
          )}
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
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
