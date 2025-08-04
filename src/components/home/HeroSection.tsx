
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="py-16 sm:py-24 px-4 bg-secondary">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-primary leading-tight">
          Affordable Exhibition Stand Designs
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto text-muted-foreground px-4">
          Get ready-to-use exhibition stand design files at an affordable price. Save time and money 
          by using our pre-designed stands that you can easily customize to your needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
          <Button asChild size="lg" className="min-w-[160px]">
            <Link to="/products">Browse Designs</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-[160px]">
            <Link to="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
