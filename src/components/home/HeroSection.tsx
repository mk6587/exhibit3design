
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="py-24 px-4 bg-secondary">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-primary">
          Affordable Exhibition Stand Designs
        </h1>
        <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-muted-foreground">
          Get ready-to-use exhibition stand design files at an affordable price. Save time and money 
          by using our pre-designed stands that you can easily customize to your needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button asChild size="lg">
            <Link to="/products">Browse Designs</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
