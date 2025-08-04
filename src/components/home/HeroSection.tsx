
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="mobile-section md:py-12 px-0 md:px-4 bg-secondary overflow-hidden">
      {/* Full-width background image for mobile */}
      <div className="md:hidden absolute inset-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=800&fit=crop" 
          alt="Exhibition background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-primary leading-tight mb-3 md:mb-4 px-4">
          Affordable Exhibition Designs
        </h1>
        <p className="text-sm md:text-base lg:text-lg xl:text-xl max-w-lg md:max-w-2xl mx-auto text-muted-foreground px-4 mb-6 md:mb-8">
          Ready-to-use design files at affordable prices
        </p>
        
        {/* Mobile: Stack buttons with primary action prominent */}
        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-6 px-4">
          <Button asChild size="lg" className="mobile-flat-btn md:min-w-[160px] text-lg font-semibold">
            <Link to="/products">Browse Designs</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="md:min-w-[160px] text-muted-foreground text-sm">
            <Link to="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
