
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/contexts/ProductsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import ImageViewer from "@/components/ui/image-viewer";
import ProductCardPreview from "@/components/product/ProductCardPreview";
import "@/components/ui/rich-text-editor.css";

const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  const [imageViewerState, setImageViewerState] = useState({
    isOpen: false,
    images: [] as string[],
    title: '',
    initialIndex: 0
  });
  
  // Filter products to show only featured ones
  const featuredProducts = products.filter(product => product.featured);

  const handleImageClick = (product: any, e: React.MouseEvent) => {
    // Only show image viewer if clicked with modifier key (Ctrl/Cmd)
    if (e.ctrlKey || e.metaKey || e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      
      const validImage = product.images[0] && !product.images[0].startsWith('blob:') 
        ? product.images[0] 
        : "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
        
      setImageViewerState({
        isOpen: true,
        images: [validImage],
        title: product.title,
        initialIndex: 0
      });
    }
    // Otherwise, let the Link handle navigation to product detail page
  };

  const closeImageViewer = () => {
    setImageViewerState(prev => ({ ...prev, isOpen: false }));
  };
  
  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8">Featured Designs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="pt-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="flex gap-1 mb-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-5 w-16" />
                </CardFooter>
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
          <>
            {/* New Design Preview */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-primary">📱 New Card Design Preview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 4).map((product) => {
                  const productForPreview = {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.images[0] && !product.images[0].startsWith('blob:') 
                      ? product.images[0] 
                      : "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
                    tags: product.tags
                  };
                  return <ProductCardPreview key={product.id} product={productForPreview} />;
                })}
              </div>
            </div>

            {/* Current Design */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-muted-foreground">Current Design</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col h-full">
                    <Link to={`/product/${product.id}`}>
                      <div className="aspect-[4/3] overflow-hidden bg-secondary clickable-image-container">
                        <img
                          src={
                            product.images[0] && !product.images[0].startsWith('blob:') 
                              ? product.images[0] 
                              : "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop"
                          }
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105 cursor-pointer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop";
                          }}
                          onClick={(e) => handleImageClick(product, e)}
                        />
                      </div>
                    </Link>
                    <CardContent className="pt-4 flex-grow">
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
                    <CardFooter className="flex justify-between border-t pt-4 mt-auto">
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
            </div>
          </>
        )}
      </div>

      <ImageViewer
        isOpen={imageViewerState.isOpen}
        onClose={closeImageViewer}
        images={imageViewerState.images}
        title={imageViewerState.title}
        initialIndex={imageViewerState.initialIndex}
      />
    </section>
  );
};

export default FeaturedProducts;
