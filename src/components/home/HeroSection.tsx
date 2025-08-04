
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="mobile-section md:py-12 px-4 bg-secondary">
      <div className="container mx-auto text-center">
        <h1 className="mobile-title md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-primary leading-tight">
          Affordable Exhibition Stand Designs
        </h1>
        <p className="mobile-subtitle md:text-base lg:text-lg xl:text-xl max-w-2xl mx-auto text-muted-foreground px-4">
          Get ready-to-use exhibition stand design files at an affordable price. Save time and money 
          by using our pre-designed stands that you can easily customize to your needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
          <Button asChild size="lg" className="mobile-flat-btn md:min-w-[160px]">
            <Link to="/products">Browse Designs</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="mobile-flat-btn md:min-w-[160px] border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link to="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
