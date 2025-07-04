
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { products } from "@/data/products";

const FeaturedProducts = () => {
  // Filter products to show only featured ones
  const featuredProducts = products.filter(product => product.featured);
  
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                </Link>
                <CardContent className="pt-4">
                  <Link to={`/product/${product.id}`} className="hover:underline">
                    <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                  </Link>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <span className="font-semibold">${product.price}</span>
                  <Link 
                    to={`/product/${product.id}`} 
                    className="text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
