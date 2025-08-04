
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, FileText, Settings, Clock, Palette, Headphones } from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Affordable Pricing",
    description: "All design files available at an affordable price - a fraction of the cost of custom designs."
  },
  {
    icon: FileText,
    title: "Multiple File Formats",
    description: "Download in SKP, 3DS, Max, and PDF formats to work with your preferred software."
  },
  {
    icon: Settings,
    title: "Ready to Customize",
    description: "Easily modify designs to match your specific requirements and client needs."
  },
  {
    icon: Clock,
    title: "Time-Saving Solution",
    description: "Skip weeks of design work and start with a professional template instantly."
  },
  {
    icon: Palette,
    title: "Designer-Created",
    description: "All designs created by an experienced exhibition stand designer with industry knowledge."
  },
  {
    icon: Headphones,
    title: "Custom Design Services",
    description: "Need something specific? We also offer affordable custom design services."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-8 md:py-12 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">Why Choose Us?</h2>
        </div>
        
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="text-center p-4 md:p-6"
              >
                <div className="mb-3 flex items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-primary rounded-lg mx-auto">
                  <IconComponent className="h-4 w-4 md:h-6 md:w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2 text-xs md:text-sm text-foreground">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed hidden md:block">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
