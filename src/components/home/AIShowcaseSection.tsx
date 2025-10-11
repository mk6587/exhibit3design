import { useState, useEffect } from "react";
import { Wand2, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface AISample {
  id: string;
  mode: string;
  beforeImage: string;
  afterImage: string;
}

const aiSamples: AISample[] = [
  {
    id: "1",
    mode: "Sketch Mode",
    beforeImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-before.png",
    afterImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-after.jpg?v=2",
  },
  {
    id: "2",
    mode: "Artistic Render",
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
  const [isRevealing, setIsRevealing] = useState(false);

  const currentSample = aiSamples[currentIndex];

  // Auto-cycle through samples
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRevealing(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % aiSamples.length);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-reveal animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealing(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            AI Transforms Your Designs — Instantly.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            See how your stand changes style with one click. No prompt needed.
          </p>
        </div>

        {/* Main transformation display */}
        <div className="max-w-5xl mx-auto mb-12">
          {/* Mode badge */}
          <div className="flex justify-center mb-4">
            <Badge 
              variant="outline" 
              className="px-4 py-2 text-sm font-medium border-primary/50 bg-primary/5"
            >
              {currentSample.mode}
            </Badge>
          </div>

          {/* Before/After container */}
          <div 
            className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
            onMouseEnter={() => setIsRevealing(true)}
            onMouseLeave={() => setIsRevealing(false)}
          >
            {/* Before image */}
            <img
              src={currentSample.beforeImage}
              alt="Original design"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* After image with reveal animation */}
            <div
              className="absolute inset-0 transition-all duration-1000 ease-out"
              style={{
                clipPath: isRevealing
                  ? "inset(0 0 0 0)"
                  : "inset(0 0 0 100%)",
              }}
            >
              <img
                src={currentSample.afterImage}
                alt="AI transformed design"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Reveal line indicator */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent transition-all duration-1000 ease-out opacity-70"
              style={{
                left: isRevealing ? "100%" : "0%",
              }}
            />

            {/* Labels */}
            <div className="absolute bottom-6 left-6">
              <Badge variant="secondary" className="backdrop-blur-sm bg-black/50 text-white border-0">
                Original
              </Badge>
            </div>
            <div className="absolute bottom-6 right-6">
              <Badge 
                className="backdrop-blur-sm border-0 transition-opacity duration-300"
                style={{ backgroundColor: "#8E44FF", opacity: isRevealing ? 1 : 0 }}
              >
                AI Result
              </Badge>
            </div>

            {/* Hover instruction */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full text-white text-sm font-medium">
                Hover to reveal transformation
              </div>
            </div>
          </div>

          {/* Sample indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {aiSamples.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsRevealing(false);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`View sample ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">{benefit.text}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            asChild
            size="lg"
            className="px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: "#8E44FF" }}
          >
            <Link to="/pricing">Create with AI Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};