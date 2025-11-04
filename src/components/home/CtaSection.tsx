
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <section className="py-12 md:py-16 px-4 bg-gradient-to-r from-primary-from via-primary to-primary-to text-white relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent animate-gradient-shift opacity-30" style={{ backgroundSize: '200% 200%' }}></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 glow-purple-strong opacity-40"></div>
      
      <div className="container mx-auto text-center relative z-10 max-w-4xl">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 drop-shadow-lg">
          Start Designing Faster Today
        </h2>
        <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-2xl mx-auto text-white/90">
          Try AI editing for free with 2 tokens. No credit card required.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary backdrop-blur-sm font-semibold shadow-lg">
            <Link to="/pricing">Get Started Free</Link>
          </Button>
        </div>
        <p className="text-sm md:text-base mt-6 md:mt-8 text-white/80">
          Access professional templates + AI tools • No design experience needed
        </p>
      </div>
    </section>
  );
};

export default CtaSection;
