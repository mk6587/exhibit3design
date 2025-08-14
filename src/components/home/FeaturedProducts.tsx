
import { Link } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useRef, useState } from "react";
import "@/components/ui/rich-text-editor.css";

const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  // Filter products to show only featured ones
  const featuredProducts = products.filter(product => product.featured);

  // Optimized video URL with compression
  const videoUrl = "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/sign/video/veo3.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYzgzYjYzNC0xYmM0LTQyNDktOTE5OS03Y2ZhMWViZTRhNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby92ZW8zLm1wNCIsImlhdCI6MTc1NDM0MjA1OSwiZXhwIjoxOTEyMDIyMDU5fQ.br8HgLwcWpmJQP8NB7UdD-vnjYLHCw641P9_-o5PTPg";

  // Intersection Observer for lazy loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(video);
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Load and play video only when in viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isIntersecting) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      // Only play if user hasn't interacted with the page yet
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay failed, show play button overlay
        });
      }
    };

    const handleLoadStart = () => {
      setIsVideoLoaded(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadstart', handleLoadStart);
    
    // Start loading the video
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [isIntersecting]);
  
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
      <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-secondary">
        {/* Video Loading Placeholder */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading video...</p>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            objectPosition: 'center center'
          }}
          loop
          muted
          playsInline
          preload="none"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Crect width='1200' height='600' fill='%23f3f4f6'/%3E%3C/svg%3E"
        >
          {isIntersecting && <source src={videoUrl} type="video/mp4" />}
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Fallback image for very slow connections */}
        {!isIntersecting && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop&crop=center&auto=format")`
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}
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
