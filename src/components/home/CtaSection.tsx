
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Create Stunning Exhibition Stands?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          Join thousands of exhibition designers who use our premium design files 
          to save time and deliver exceptional results.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" variant="secondary">
            <Link to="/products">Browse All Designs</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
            <Link to="/contact">Contact Our Team</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
