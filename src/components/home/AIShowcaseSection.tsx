import { useState, useEffect } from "react";
import { Wand2, Zap, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

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
  const [isRevealing, setIsRevealing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const currentSample = aiSamples[currentIndex];

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50;

  // Auto-cycle through samples (pauses on hover)
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      // Change image immediately, then reset reveal state
      setCurrentIndex((prev) => (prev + 1) % aiSamples.length);
      setIsRevealing(false);
    }, 8000); // Slower: 8 seconds instead of 5

    return () => clearInterval(interval);
  }, [isHovered]);

  // Auto-reveal animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealing(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handlePrevious = () => {
    setIsRevealing(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + aiSamples.length) % aiSamples.length);
    }, 300);
  };

  const handleNext = () => {
    setIsRevealing(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % aiSamples.length);
    }, 300);
  };

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
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
        <div className="max-w-5xl mx-auto mb-8 md:mb-12">
          {/* Mode badge */}
          <div className="flex justify-center mb-3 md:mb-4">
            <Badge 
              variant="outline" 
              className="px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium border-primary/50 bg-primary/5"
            >
              {currentSample.mode}
            </Badge>
          </div>

          {/* Before/After container */}
          <div 
            className="relative aspect-[16/9] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl group"
            onMouseEnter={() => {
              setIsHovered(true);
              setIsRevealing(true);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setIsRevealing(false);
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Before image/video */}
            {currentSample.beforeVideo ? (
              <video
                src={currentSample.beforeVideo}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={currentSample.beforeImage}
                alt="Original design"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* After image/video with reveal animation */}
            <div
              className="absolute inset-0 transition-all duration-[1500ms] ease-out"
              style={{
                clipPath: isRevealing
                  ? "inset(0 0 0 0)"
                  : "inset(0 0 0 100%)",
              }}
            >
              {currentSample.afterVideo ? (
                <video
                  src={currentSample.afterVideo}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={currentSample.afterImage}
                  alt="AI transformed design"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Reveal line indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-transparent via-white to-transparent transition-all duration-[1500ms] ease-out opacity-70"
              style={{
                left: isRevealing ? "100%" : "0%",
              }}
            />

            {/* Labels */}
            <div 
              className="absolute bottom-3 md:bottom-6 left-3 md:left-6 transition-opacity duration-700 ease-in-out"
              style={{ 
                opacity: isRevealing ? 0 : 1,
                transitionDelay: isRevealing ? '0ms' : '300ms'
              }}
            >
              <Badge variant="secondary" className="backdrop-blur-sm bg-black/50 text-white border-0 text-xs md:text-sm">
                Original
              </Badge>
            </div>
            <div 
              className="absolute bottom-3 md:bottom-6 right-3 md:right-6 transition-opacity duration-700 ease-in-out"
              style={{ 
                opacity: isRevealing ? 1 : 0,
                transitionDelay: isRevealing ? '300ms' : '0ms'
              }}
            >
              <Badge 
                className="backdrop-blur-sm border-0 text-xs md:text-sm text-white"
                style={{ backgroundColor: "#8E44FF" }}
              >
                AI Result
              </Badge>
            </div>

            {/* Navigation arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 md:h-11 md:w-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 md:h-11 md:w-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </Button>

            {/* Hover instruction - desktop only */}
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full text-white text-sm font-medium">
                Hover to reveal • Use arrows to navigate
              </div>
            </div>
          </div>

          {/* Sample indicators */}
          <div className="flex justify-center items-center gap-2 mt-3 md:mt-4">
            {aiSamples.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsRevealing(false);
                  setTimeout(() => setCurrentIndex(index), 300);
                }}
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
            asChild
            size="lg"
            className="px-6 py-5 md:px-8 md:py-6 text-sm md:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: "#8E44FF" }}
          >
            <Link to="/pricing">Create with AI Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};