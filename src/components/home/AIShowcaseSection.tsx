import { useState, useEffect } from "react";
import { Wand2, Zap, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProtectedExternalLink } from "@/hooks/useProtectedExternalLink";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

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

  const currentSample = aiSamples[currentIndex];
  const pricingUrl = "https://ai.exhibit3design.com/";

  // Auto-cycle through samples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % aiSamples.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

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

        {/* Main transformation display */}
        <div className="max-w-5xl mx-auto mb-8 md:mb-12 relative">
          <BeforeAfterSlider
            beforeImage={currentSample.beforeImage}
            afterImage={currentSample.afterImage}
            beforeVideo={currentSample.beforeVideo}
            afterVideo={currentSample.afterVideo}
            mode={currentSample.mode}
          />

          {/* Navigation arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 h-9 w-9 md:h-11 md:w-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 h-9 w-9 md:h-11 md:w-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20"
            onClick={handleNext}
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </Button>
        </div>

        {/* Sample indicators */}
        <div className="flex justify-center items-center gap-2 mt-3 md:mt-4 max-w-5xl mx-auto">
          {aiSamples.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: index === currentIndex ? '10px' : '8px',
                height: index === currentIndex ? '10px' : '8px',
                minWidth: index === currentIndex ? '10px' : '8px',
                minHeight: index === currentIndex ? '10px' : '8px',
              }}
              className={`rounded-full transition-all flex-shrink-0 ${
                index === currentIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
              }`}
              aria-label={`View sample ${index + 1}`}
            />
          ))}
        </div>

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