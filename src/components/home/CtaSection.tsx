
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <section className="py-8 md:py-12 px-0 md:px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative overflow-hidden">
      {/* Full-width background pattern for mobile */}
      <div className="absolute inset-0 opacity-20 md:hidden">
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10"></div>
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-xl md:text-4xl font-bold mb-3 md:mb-6 px-4">
          Ready to Start?
        </h2>
        <p className="text-sm md:text-lg mb-6 md:mb-8 max-w-lg md:max-w-2xl mx-auto opacity-90 px-4">
          Browse our designs or get custom work
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 px-4">
          <Button asChild size="lg" variant="secondary" className="font-semibold">
            <Link to="/products">Browse Designs</Link>
          </Button>
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
            <Link to="/contact">Custom Design</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
