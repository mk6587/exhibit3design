
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
          Start Designing Faster Today
        </h2>
        <p className="text-sm md:text-lg mb-6 md:mb-8 max-w-lg md:max-w-2xl mx-auto opacity-90 px-4">
          Try AI editing for free with 5 tokens. No credit card required.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 px-4">
          <Button asChild size="lg" variant="secondary" className="font-semibold">
            <Link to="/pricing">Get 5 Free Tokens</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10">
            <Link to="/ai-samples">See AI in Action</Link>
          </Button>
        </div>
        <p className="text-xs md:text-sm mt-3 md:mt-4 opacity-70 px-4">
          Access professional templates + AI tools • No design experience needed
        </p>
      </div>
    </section>
  );
};

export default CtaSection;
