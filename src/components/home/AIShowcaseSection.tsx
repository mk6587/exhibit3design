import { useState } from "react";
import { Wand2, Zap, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProtectedExternalLink } from "@/hooks/useProtectedExternalLink";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { useIsMobile } from "@/hooks/use-mobile";

interface AISample {
  id: string;
  mode: string;
  type: 'image' | 'video';
  beforeImage?: string;
  afterImage?: string;
  beforeVideo?: string;
  afterVideo?: string;
}

const aiSamples: AISample[] = [
  {
    id: "1",
    mode: "Sketch Mode",
    type: 'image',
    beforeImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-before.png",
    afterImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-after.jpg?v=2",
  },
  {
    id: "2",
    mode: "Video Generation",
    type: 'video',
    beforeImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/3/video-rotating.jpg",
    afterVideo: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/3/video-rotating.mp4",
  },
  {
    id: "3",
    mode: "360° Walkthrough",
    type: 'video',
    beforeImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/4/walkthrough-before.png",
    afterVideo: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/4/walkthrough-video-after.mp4",
  },
  {
    id: "4",
    mode: "Artistic Render",
    type: 'image',
    beforeImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-before.jpeg?v=2",
    afterImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-after.jpg?v=2",
  },
];

const benefits = [
  {
    icon: Zap,
    text: "Instant AI transformation",
  },
  {
    icon: Wand2,
    text: "No design experience needed",
  },
  {
    icon: CheckCircle2,
    text: "Presentation-ready results",
  },
];

export const AIShowcaseSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { navigateToProtectedLink } = useProtectedExternalLink();
  const isMobile = useIsMobile();
  const pricingUrl = "https://ai.exhibit3design.com/";

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + aiSamples.length) % aiSamples.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % aiSamples.length);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            AI Transforms Your Designs — Instantly.
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            See how your stand changes style with one click. No prompt needed.
          </p>
        </div>

        {/* Mobile: Carousel view */}
        {isMobile ? (
          <div className="relative max-w-full mx-auto mb-8 px-4">
            <BeforeAfterSlider
              beforeImage={aiSamples[currentIndex].beforeImage}
              afterImage={aiSamples[currentIndex].afterImage}
              beforeVideo={aiSamples[currentIndex].beforeVideo}
              afterVideo={aiSamples[currentIndex].afterVideo}
              mode={aiSamples[currentIndex].mode}
            />
            
            {/* Navigation arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 hover:bg-background/90 backdrop-blur-sm border"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 hover:bg-background/90 backdrop-blur-sm border"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Indicators */}
            <div className="flex justify-center items-center gap-3 mt-4">
              {aiSamples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all ${
                    index === currentIndex
                      ? "w-2.5 h-2.5 bg-primary"
                      : "w-2.5 h-2.5 bg-muted-foreground/40"
                  }`}
                  aria-label={`View sample ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Desktop: Grid of 4 before/after sliders */
          <div className="max-w-7xl mx-auto mb-8 md:mb-12 grid grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {aiSamples.map((sample) => (
              <div key={sample.id} className="w-full">
                <BeforeAfterSlider
                  beforeImage={sample.beforeImage}
                  afterImage={sample.afterImage}
                  beforeVideo={sample.beforeVideo}
                  afterVideo={sample.afterVideo}
                  mode={sample.mode}
                />
              </div>
            ))}
          </div>
        )}

        {/* Benefits - Hidden on mobile, compact on desktop */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-medium">{benefit.text}</p>
            </div>
          ))}
        </div>
        
        {/* Mobile benefits - ultra compact */}
        <div className="md:hidden flex justify-center gap-6 mb-8 px-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <benefit.icon className="h-4 w-4 text-primary" />
              <p className="text-[10px] text-center max-w-[70px] leading-tight">{benefit.text}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="px-6 py-5 md:px-8 md:py-6 text-sm md:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: "#8E44FF" }}
            onClick={() => navigateToProtectedLink(pricingUrl)}
          >
            Create with AI Now
          </Button>
        </div>
      </div>
    </section>
  );
};