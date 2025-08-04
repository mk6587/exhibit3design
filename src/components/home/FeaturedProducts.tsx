
import { Link } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import "@/components/ui/rich-text-editor.css";

const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  
  // Filter products to show only featured ones
  const featuredProducts = products.filter(product => product.featured);
  
  if (loading) {
    return (
      <>
        {/* Full-width video section */}
        <section className="relative w-full max-w-6xl mx-auto h-[400px] md:h-[600px] overflow-hidden">
        <video
          className="w-full h-full object-cover"
          style={{ 
            objectPosition: 'center center'
          }}
          autoPlay
          loop
          muted
          playsInline
        >
            <source src="https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/sign/video/veo3.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYzgzYjYzNC0xYmM0LTQyNDktOTE5OS03Y2ZhMWViZTRhNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby92ZW8zLm1wNCIsImlhdCI6MTc1NDM0MjA1OSwiZXhwIjoxOTEyMDIyMDU5fQ.br8HgLwcWpmJQP8NB7UdD-vnjYLHCw641P9_-o5PTPg" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/20" />
        </section>
        
        <section className="py-6 md:py-12 px-0 md:px-4">
        <div className="w-full md:container md:mx-auto">
          <h2 className="text-lg md:text-3xl font-bold mb-4 md:mb-8 px-4 md:px-0">Featured Designs</h2>
          <div className="px-4 md:px-0">
            <Carousel className="w-full">
              <CarouselContent>
                {[1, 2, 3, 4, 5].map((i) => (
                  <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
        </section>
      </>
    );
  }
  
  return (
    <>
      {/* Full-width video section */}
      <section className="relative w-full max-w-6xl mx-auto h-[400px] md:h-[600px] overflow-hidden">
        <video
          className="w-full h-full object-cover"
          style={{ 
            objectPosition: 'center center'
          }}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/sign/video/veo3.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYzgzYjYzNC0xYmM0LTQyNDktOTE5OS03Y2ZhMWViZTRhNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby92ZW8zLm1wNCIsImlhdCI6MTc1NDM0MjA1OSwiZXhwIjoxOTEyMDIyMDU5fQ.br8HgLwcWpmJQP8NB7UdD-vnjYLHCw641P9_-o5PTPg" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/20" />
      </section>
      
      <section className="py-6 md:py-12 px-0 md:px-4">
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
          <div className="px-4 md:px-0">
            <Carousel 
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredProducts.slice(0, 8).map((product) => {
                  const imageUrl = product.images[0] && !product.images[0].startsWith('blob:') 
                    ? product.images[0] 
                    : "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
                  
                  return (
                    <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <Link to={`/product/${product.id}`} className="block group">
                        <div className="relative overflow-hidden rounded-lg bg-secondary">
                          <div className="aspect-[4/3] overflow-hidden">
                            <img 
                              src={imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1">{product.title}</h3>
                            <p className="text-lg md:text-xl font-bold">${product.price}</p>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 border-none bg-white/80 hover:bg-white" />
              <CarouselNext className="hidden md:flex -right-12 border-none bg-white/80 hover:bg-white" />
            </Carousel>
          </div>
        )}
      </div>
      </section>
    </>
  );
};

export default FeaturedProducts;
