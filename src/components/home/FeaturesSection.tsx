
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
    <section className="py-16 px-4 featured-section">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Use Our Design Files?</h2>
          <p className="text-muted-foreground">
            Get professional exhibition stand designs at a fraction of the cost, 
            ready to customize for your next project.
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
