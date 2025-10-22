import { useState, useEffect } from "react";
import { Wand2, Zap, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProtectedExternalLink } from "@/hooks/useProtectedExternalLink";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface AISample {
  id: string;
  mode_label: string;
  type: 'image' | 'video';
  before_image_url?: string;
  after_image_url?: string;
  before_video_url?: string;
  after_video_url?: string;
}

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
  const [aiSamples, setAiSamples] = useState<AISample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { navigateToProtectedLink } = useProtectedExternalLink();
  const isMobile = useIsMobile();
  const pricingUrl = "https://ai.exhibit3design.com/";

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_samples')
        .select('*')
        .eq('is_active', true)
        .eq('show_on_homepage', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      // Map database fields to component interface
      const mappedSamples: AISample[] = (data || []).map((sample: any) => ({
        id: sample.id,
        mode_label: sample.mode_label,
        type: sample.type as 'image' | 'video',
        before_image_url: sample.before_image_url,
        after_image_url: sample.after_image_url,
        before_video_url: sample.before_video_url,
        after_video_url: sample.after_video_url,
      }));
      
      setAiSamples(mappedSamples);
    } catch (error) {
      console.error('Error fetching AI samples:', error);
      // Fallback to empty array on error
      setAiSamples([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + aiSamples.length) % aiSamples.length;
    console.log('Previous clicked:', { currentIndex, newIndex, totalSamples: aiSamples.length });
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % aiSamples.length;
    console.log('Next clicked:', { currentIndex, newIndex, totalSamples: aiSamples.length });
    setCurrentIndex(newIndex);
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (aiSamples.length === 0) {
    return null; // Don't show section if no samples
  }

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
              key={`mobile-${currentIndex}-${aiSamples[currentIndex]?.id}`}
              beforeImage={aiSamples[currentIndex].before_image_url}
              afterImage={aiSamples[currentIndex].after_image_url}
              beforeVideo={aiSamples[currentIndex].before_video_url}
              afterVideo={aiSamples[currentIndex].after_video_url}
              mode={aiSamples[currentIndex].mode_label}
            />
            
            {/* Navigation arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm border-2 shadow-lg"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm border-2 shadow-lg"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </Button>

            {/* Indicators */}
            <div className="flex justify-center items-center gap-2 mt-6">
              {aiSamples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all flex-shrink-0 touch-manipulation ${
                    index === currentIndex
                      ? "w-3 h-3 bg-primary"
                      : "w-2.5 h-2.5 bg-muted-foreground/40"
                  }`}
                  style={{ minWidth: index === currentIndex ? '12px' : '10px', minHeight: index === currentIndex ? '12px' : '10px' }}
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
                  beforeImage={sample.before_image_url}
                  afterImage={sample.after_image_url}
                  beforeVideo={sample.before_video_url}
                  afterVideo={sample.after_video_url}
                  mode={sample.mode_label}
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