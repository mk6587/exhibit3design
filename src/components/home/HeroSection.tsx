
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-purple-50 to-indigo-50">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600">
          Professional Exhibition Stand Designs
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-700">
          Download high-quality exhibition stand design files for your next project. 
          We offer SKP, 3DS, Max, and PDF formats for all your exhibition needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
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
