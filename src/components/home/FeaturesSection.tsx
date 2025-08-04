
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const features = [
  {
    title: "Affordable Pricing",
    description: "All design files available at an affordable price - a fraction of the cost of custom designs."
  },
  {
    title: "Multiple File Formats",
    description: "Download in SKP, 3DS, Max, and PDF formats to work with your preferred software."
  },
  {
    title: "Ready to Customize",
    description: "Easily modify designs to match your specific requirements and client needs."
  },
  {
    title: "Time-Saving Solution",
    description: "Skip weeks of design work and start with a professional template instantly."
  },
  {
    title: "Designer-Created",
    description: "All designs created by an experienced exhibition stand designer with industry knowledge."
  },
  {
    title: "Custom Design Services",
    description: "Need something specific? We also offer affordable custom design services."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-6 md:py-12 px-4 featured-section">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">Why Choose Us?</h2>
          <p className="text-sm md:text-base text-muted-foreground hidden md:block">
            Professional designs at affordable prices
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-background border-border hover:border-primary/30 transition-all duration-200">
              <CardContent className="p-3 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                  <div className="mb-2 md:mb-0 md:mt-1 bg-primary p-1 md:p-2 rounded-sm w-fit">
                    <Check className="h-3 w-3 md:h-4 md:w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 md:mb-3 text-xs md:text-base">{feature.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed hidden md:block">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
