import { Link } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { VideoStream } from "@/components/performance/VideoStream";
import { useState } from "react";
import "@/components/ui/rich-text-editor.css";

const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Filter products to show only featured ones
  const featuredProducts = products.filter(product => product.featured);

  // Video URLs - MP4 fallback and HLS streaming
  const videoUrl = "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/sign/video/veo3.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYzgzYjYzNC0xYmM0LTQyNDktOTE5OS03Y2ZhMWViZTRhNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby92ZW8zLm1wNCIsImlhdCI6MTc1NDM0MjA1OSwiZXhwIjoxOTEyMDIyMDU5fQ.br8HgLwcWpmJQP8NB7UdD-vnjYLHCw641P9_-o5PTPg";
  // For future HLS implementation
  const hlsUrl = "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/video/veo3.m3u8"; // When available
  
  if (loading) {
    return (
      <>
        {/* Full-width video section - Loading State */}
        <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-secondary">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading content...</p>
            </div>
          </div>
        </section>
        
        <section className="py-6 md:py-12 px-0 md:px-4">
        <div className="w-full md:container md:mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
            Featured Products
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
      </>
    );
  }
  
  return (
    <>
      {/* Full-width video section with HLS streaming */}
      <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-secondary">
        <VideoStream
          src={videoUrl}
          // hlsUrl={hlsUrl} // Enable when HLS version is available
          autoPlay
          loop
          muted
          playsInline
          className="object-cover"
          style={{ objectPosition: 'center center' }}
          onLoadStart={() => setIsVideoLoaded(false)}
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={(error) => console.error('Video streaming error:', error)}
        />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Hero content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Premium Exhibition Stands
            </h1>
            <p className="text-xl md:text-2xl mb-8 drop-shadow-lg max-w-2xl mx-auto">
              Transform your brand presence with our cutting-edge exhibition stand designs
            </p>
            <Link 
              to="/products" 
              className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
            >
              Explore Our Designs
            </Link>
          </div>
        </div>
      </section>
      
      <section className="py-6 md:py-12 px-0 md:px-4">
      <div className="w-full md:container md:mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
          Featured Products
        </h2>
        
        <div className="px-4 md:px-0">
          {featuredProducts.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <div className="bg-card rounded-lg shadow-sm border p-4 h-full">
                        <div className="aspect-[4/3] relative mb-4 overflow-hidden rounded-md">
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.title}
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg leading-tight">
                            {product.title}
                          </h3>
                          
                          {product.memo && (
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {product.memo}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-2xl font-bold text-primary">
                              ${product.price}
                            </span>
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
    </>
  );
};

export default FeaturedProducts;