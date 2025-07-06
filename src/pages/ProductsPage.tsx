
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard, { Product } from "@/components/product/ProductCard";
import { useProducts } from "@/contexts/ProductsContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ProductsPage = () => {
  const { products, loading } = useProducts();
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("latest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  console.log('ProductsPage rendering:', { productsCount: products?.length, loading });
  
  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Browse Exhibition Stand Designs</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Ensure products is an array
  const safeProducts = Array.isArray(products) ? products : [];
  
  // Convert products to match ProductCard interface
  const allProducts: Product[] = safeProducts.map(product => ({
    id: product.id,
    title: product.title,
    price: product.price,
    image: (product.images && product.images[0] && !product.images[0].startsWith('blob:')) 
      ? product.images[0] 
      : "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
    tags: product.tags || []
  }));

  // Get unique tags from products
  const allTags = Array.from(new Set(allProducts.flatMap(product => product.tags || [])));
  
  // Filter and sort products
  const filteredProducts = allProducts
    .filter(product => {
      // Text search
      const matchesSearch = product.title.toLowerCase().includes(searchText.toLowerCase());
      
      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => (product.tags || []).includes(tag));
        
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.id - a.id; // Latest by default (assuming higher ID = newer)
    });
  
  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const clearFilters = () => {
    setSearchText("");
    setSelectedTags([]);
    setSort("latest");
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Browse Exhibition Stand Designs</h1>
        
        {/* Filters */}
        <div className="mb-8 space-y-4">
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
          
          {allTags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Filter by format:</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {(searchText || selectedTags.length > 0 || sort !== "latest") && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
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
            <h3 className="text-xl font-medium mb-2">
              {safeProducts.length === 0 ? "No products available" : "No designs found"}
            </h3>
            <p className="text-muted-foreground">
              {safeProducts.length === 0 
                ? "Please check back later or contact support if this persists." 
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;
