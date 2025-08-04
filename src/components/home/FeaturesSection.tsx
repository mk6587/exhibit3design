
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
    <section className="py-8 md:py-12 px-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="w-full">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12 px-4">
          <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">Why Choose Us?</h2>
          <p className="text-sm md:text-base text-slate-300 hidden md:block">
            Professional designs at affordable prices
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="group relative bg-slate-800/50 border-r border-b border-slate-700/50 p-6 md:p-8 hover:bg-slate-700/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-accent rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="font-bold mb-3 text-base md:text-lg text-white group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed hidden md:block group-hover:text-slate-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
