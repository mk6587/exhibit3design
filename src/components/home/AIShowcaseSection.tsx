import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface AISample {
  id: string;
  title: string;
  category: string;
  type: 'image' | 'video';
  beforeImage?: string;
  afterImage?: string;
  beforeVideo?: string;
  afterVideo?: string;
  prompt: string;
}

// Sample data - will be replaced with real data from database
const aiSamples: AISample[] = [
  {
    id: "1",
    title: "Sketch Transformation",
    category: "Image Artistic Mode",
    type: 'image',
    beforeImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-before.png",
    afterImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-after.jpg",
    prompt: "convert this photo into a detailed pencil sketch with artistic shading"
  },
  {
    id: "2",
    title: "Video Generation",
    category: "AI Video Creation",
    type: 'video',
    beforeVideo: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/videos/sample-before.mp4",
    afterVideo: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/videos/sample-after.mp4",
    prompt: "create a cinematic video with smooth camera movement"
  },
  {
    id: "3",
    title: "Portrait Enhancement",
    category: "Image Artistic Mode",
    type: 'image',
    beforeImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-before.jpeg",
    afterImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-after.jpg",
    prompt: "straighten her hair and change her sweater to a green t-shirt"
  }
];

export const AIShowcaseSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAfter, setShowAfter] = useState(false);

  const currentSample = aiSamples[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % aiSamples.length);
    setShowAfter(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + aiSamples.length) % aiSamples.length);
    setShowAfter(false);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Editing</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See How AI Transforms Your Designs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Instantly customize exhibition stands with simple text prompts. No design skills needed.
          </p>
        </div>

        {/* Carousel */}
        <Card className="overflow-hidden border-2">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Before/After Media */}
              <div className="relative h-[600px]">
                {currentSample.type === 'image' ? (
                  <img
                    src={showAfter ? currentSample.afterImage : currentSample.beforeImage}
                    alt={showAfter ? "After AI edit" : "Before AI edit"}
                    className="w-full h-full object-contain bg-muted transition-opacity duration-300"
                  />
                ) : (
                  <video
                    src={showAfter ? currentSample.afterVideo : currentSample.beforeVideo}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                )}
                <Badge 
                  className="absolute top-4 left-4 text-sm font-semibold"
                  variant={showAfter ? "default" : "secondary"}
                >
                  {showAfter ? "After" : "Before"}
                </Badge>
                
                {/* Toggle Button */}
                <Button
                  onClick={() => setShowAfter(!showAfter)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2"
                  variant="secondary"
                >
                  {showAfter ? "Show Before" : "Show After"}
                </Button>
              </div>

              {/* Info Panel */}
              <div className="p-8 flex flex-col justify-between bg-card">
                <div>
                  <Badge variant="outline" className="mb-4">
                    {currentSample.category}
                  </Badge>
                  <h3 className="text-2xl font-bold mb-4">
                    {currentSample.title}
                  </h3>
                  
                  {/* Prompt Display */}
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">AI Prompt Used:</p>
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <p className="text-sm italic">"{currentSample.prompt}"</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Advanced AI-powered editing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Instant results in seconds</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>No design experience needed</span>
                    </div>
                  </div>
                </div>

                {/* Navigation & CTA */}
                <div className="space-y-4">
                  {/* Carousel Navigation */}
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      onClick={prevSlide}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 flex-shrink-0"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    
                    <div className="flex gap-2 flex-1 justify-center">
                      {aiSamples.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentIndex(index);
                            setShowAfter(false);
                          }}
                          className={`h-2 rounded-full transition-all ${
                            index === currentIndex 
                              ? "w-8 bg-primary" 
                              : "w-2 bg-muted-foreground/30"
                          }`}
                          aria-label={`Go to sample ${index + 1}`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={nextSlide}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 flex-shrink-0"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* CTA Button */}
                  <Button asChild className="w-full" size="lg">
                    <Link to="/pricing">
                      Try AI for Free
                    </Link>
                  </Button>
                  
                  <p className="text-center text-xs text-muted-foreground">
                    Get 5 free AI tokens to explore
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Badge */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Powered by cutting-edge AI technology
          </p>
        </div>
      </div>
    </section>
  );
};
