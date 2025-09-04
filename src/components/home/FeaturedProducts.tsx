import { Link } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { VideoStream } from "@/components/performance/VideoStream";
import { useState } from "react";
import "@/components/ui/rich-text-editor.css";
const FeaturedProducts = () => {
  const {
    products,
    loading
  } = useProducts();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Filter products to show only featured ones
  const featuredProducts = products.filter(product => product.featured);

  // Your specific video URL - now using public bucket for faster loading
  const videoUrl = "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/videos-public/veo3.mp4";
  const hasVideo = true; // Since we have a direct video URL

  if (loading) {
    return <>
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
              {[...Array(3)].map((_, index) => <div key={index} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>)}
            </div>
          </div>
        </div>
        </section>
      </>;
  }
  return <>
      {/* Full-width hero section */}
      <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-secondary">
        {hasVideo && videoUrl ? (
          <>
            <VideoStream
              src={videoUrl}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center center' }}
              autoPlay
              loop
              muted
              playsInline
              onLoadStart={() => {
                console.log('Video load started');
                setIsVideoLoaded(false);
              }}
              onLoadedData={() => {
                console.log('Video loaded successfully');
                setIsVideoLoaded(true);
              }}
              onError={(error) => {
                console.error('Video loading error:', error);
                console.error('Video URL:', videoUrl);
              }}
            />
            <div className="absolute inset-0 bg-black/20" />
          </>
        ) :
      // Fallback to beautiful hero image
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop&crop=center&auto=format&q=80")`
      }}>
            <div className="absolute inset-0 bg-black/30" />
          </div>}
        
        {/* Hero content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 16px rgba(0, 0, 0, 0.6)'
          }}>
              Premium Exhibition Stands
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto" style={{
            textShadow: '1px 1px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 0, 0, 0.5)'
          }}>Get it done faster with affordable, ready-made designs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-purple-600/50 text-white border-purple-400 hover:bg-purple-600/60">
                <Link to="/products">Explore Our Designs</Link>
              </Button>
              {!hasVideo && <div className="text-sm text-white/80 bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  💡 Upload a video to the 'videos' storage bucket to replace this image
                </div>}
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-6 md:py-12 px-0 md:px-4">
      <div className="w-full md:container md:mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
          Featured Products
        </h2>
        
        <div className="px-4 md:px-0">
          {featuredProducts.length > 0 ? <Carousel opts={{
            align: "start",
            loop: true
          }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredProducts.map(product => <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <div className="bg-card rounded-lg shadow-sm border overflow-hidden h-full">
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img src={product.images?.[0] || "/placeholder.svg"} alt={product.title} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" loading="lazy" />
                        </div>
                        
                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold text-lg leading-tight">
                            {product.title}
                          </h3>
                          
                          {product.memo && <p className="text-muted-foreground text-sm line-clamp-2">
                              {product.memo}
                            </p>}
                          
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-2xl font-bold text-primary">
                              ${product.price}
                            </span>
                            <Link to={`/product/${product.id}`} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel> : <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-4">
                No featured products available
              </h3>
              <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors">
                Browse All Products
              </Link>
            </div>}
        </div>
        
        <div className="text-center mt-8">
          <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
            View All Products
          </Link>
        </div>
      </div>
      </section>
    </>;
};
export default FeaturedProducts;