
import { Card, CardContent } from "@/components/ui/card";
import { Zap, FileText, Palette, DollarSign, Star, Shield } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Speed",
    description: "Complete client presentations in minutes, not days, with instant AI customization."
  },
  {
    icon: FileText,
    title: "Ready-Made Templates",
    description: "Start with professional designs, not blank files. Skip the initial design phase."
  },
  {
    icon: Palette,
    title: "Instant Customization",
    description: "Restyle, recolor, and render designs with simple AI prompts. No design skills needed."
  },
  {
    icon: DollarSign,
    title: "No Per-File Costs",
    description: "Subscribe once, access all design files. Predictable monthly pricing."
  },
  {
    icon: Star,
    title: "Professional Quality",
    description: "Every template created by experienced exhibition stand designers."
  },
  {
    icon: Shield,
    title: "Free to Try",
    description: "Get 5 AI tokens to test before subscribing. Experience the power yourself."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-8 md:py-12 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">Design Faster with AI-Enhanced Workflows</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Access professional exhibition stand templates and customize them instantly with AI. Do more in less time.
          </p>
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
