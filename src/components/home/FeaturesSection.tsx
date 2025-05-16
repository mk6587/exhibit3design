
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const features = [
  {
    title: "Multiple File Formats",
    description: "All designs available in SKP, 3DS, Max and PDF formats to fit your workflow."
  },
  {
    title: "High Quality Renders",
    description: "Professional quality rendering and realistic material settings included."
  },
  {
    title: "Easy Customization",
    description: "Well-organized layers and materials for quick and simple customization."
  },
  {
    title: "Technical Documentation",
    description: "Detailed specs and build instructions included with every design."
  },
  {
    title: "Commercial License",
    description: "Use our designs for your commercial exhibition projects."
  },
  {
    title: "Support Included",
    description: "Expert assistance available if you have questions about the files."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-16 px-4 featured-section">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Our Design Files?</h2>
          <p className="text-muted-foreground">
            Our exhibition stand designs give you everything you need to impress clients 
            and create stunning exhibition experiences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-1 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
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
