import { Link } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const FeaturedProductsGrid = () => {
  const { products, loading } = useProducts();
  const featuredProducts = products.filter(product => product.featured);

  if (loading) {
    return (
      <section className="py-6 md:py-12 px-0 md:px-4">
        <div className="w-full md:container md:mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
          Featured Designs
        </h2>
          
          <div className="px-4 md:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-12 px-0 md:px-4">
      <div className="w-full md:container md:mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
          Featured Designs
        </h2>
        
        <div className="px-4 md:px-0">
          {featuredProducts.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                loop: true
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredProducts.map(product => (
                  <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <div className="bg-card rounded-lg shadow-sm border overflow-hidden h-full">
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img 
                            src={product.images?.[0] || "/placeholder.svg"} 
                            alt={product.title} 
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" 
                            loading="lazy" 
                          />
                        </div>
                        
                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold text-lg leading-tight">
                            {product.title}
                          </h3>
                          
                          {product.memo && (
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {product.memo}
                            </p>
                          )}
                          
                          <div className="flex justify-end pt-2">
                            <Link 
                              to={`/product/${product.id}`} 
                              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-4">
                No featured products available
              </h3>
              <Link 
                to="/products" 
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
        
        <div className="text-center mt-8">
          <Link 
            to="/products" 
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};
