
import ProductCard from "@/components/product/ProductCard";
import { Link } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import "@/components/ui/rich-text-editor.css";

const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  
  // Filter products to show only featured ones
  const featuredProducts = products.filter(product => product.featured);
  
  if (loading) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Featured Designs</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden aspect-square">
                <Skeleton className="h-full w-full" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-6 md:py-12 px-0 md:px-4">
      {/* Full-width container for mobile */}
      <div className="w-full md:container md:mx-auto">
        <div className="flex justify-between items-baseline mb-4 md:mb-8 px-4 md:px-0">
          <h2 className="text-lg md:text-3xl font-bold">Featured Designs</h2>
          <Link to="/products" className="text-primary hover:underline text-xs md:text-base">
            View All
          </Link>
        </div>
        
        {featuredProducts.length === 0 ? (
          <div className="text-center py-8 md:py-12 px-4">
            <p className="text-muted-foreground text-sm md:text-lg">No featured products available</p>
          </div>
        ) : (
          <div className="overflow-x-auto md:overflow-visible">
            <div className="flex md:grid gap-3 md:gap-6 pb-4 md:pb-0 px-4 md:px-0 md:grid-cols-2 lg:grid-cols-4" style={{ width: 'max-content' }}>
              {featuredProducts.slice(0, 6).map((product) => {
                const productForCard = {
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  image: product.images[0] && !product.images[0].startsWith('blob:') 
                    ? product.images[0] 
                    : "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
                  tags: product.tags
                };
                return (
                  <div key={product.id} className="w-32 md:w-auto flex-shrink-0">
                    <ProductCard product={productForCard} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
