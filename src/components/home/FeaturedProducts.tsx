
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
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8">Featured Designs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Designs</h2>
          <Link to="/products" className="text-primary hover:underline">
            View All
          </Link>
        </div>
        
        {featuredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const productForCard = {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.images[0] && !product.images[0].startsWith('blob:') 
                  ? product.images[0] 
                  : "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
                tags: product.tags
              };
              return <ProductCard key={product.id} product={productForCard} />;
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
