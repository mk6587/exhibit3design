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
const aiSamples: AISample[] = [{
  id: "1",
  title: "Sketch Transformation",
  category: "Image Artistic Mode",
  type: 'image',
  beforeImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-before.png",
  afterImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-after.jpg",
  prompt: "convert this photo into a detailed pencil sketch with artistic shading"
}, {
  id: "2",
  title: "Video Generation",
  category: "AI Video Creation",
  type: 'video',
  beforeImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/3/video-rotating.jpg",
  afterVideo: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/3/video-rotating.mp4",
  prompt: "create a cinematic video with smooth camera movement"
}, {
  id: "3",
  title: "Portrait Enhancement",
  category: "Image Magic Edit",
  type: 'image',
  beforeImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-before.jpeg?v=2",
  afterImage: "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-after.jpg?v=2",
  prompt: "straighten her hair and change her sweater to a green t-shirt"
}];
export const AIShowcaseSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAfter, setShowAfter] = useState(false);
  const currentSample = aiSamples[currentIndex];
  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % aiSamples.length);
    setShowAfter(false);
  };
  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + aiSamples.length) % aiSamples.length);
    setShowAfter(false);
  };
  return <section className="py-8 md:py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-3">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Editing</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            See How AI Transforms Your Designs
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Instantly customize exhibition stands with simple text prompts. No design skills needed.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Carousel */}
        <Card className="overflow-hidden border-0">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-[1.3fr_1fr]">
              {/* Before/After Media */}
              <div className="relative aspect-[16/10] bg-black overflow-hidden">
                {showAfter && currentSample.afterVideo ? <video src={currentSample.afterVideo} className="w-full h-full object-cover" autoPlay loop muted playsInline /> : showAfter && currentSample.afterImage ? <img src={currentSample.afterImage} alt="After AI edit" className="w-full h-full object-cover transition-opacity duration-300" /> : !showAfter && currentSample.beforeImage ? <img src={currentSample.beforeImage} alt="Before AI edit" className="w-full h-full object-cover transition-opacity duration-300" /> : <video src={currentSample.beforeVideo} className="w-full h-full object-cover" autoPlay loop muted playsInline />}
                <Badge className="absolute top-4 left-4 text-sm font-semibold" variant={showAfter ? "default" : "secondary"}>
                  {showAfter ? "After" : "Before"}
                </Badge>
              </div>

              {/* Info Panel */}
              <div className="p-4 flex flex-col justify-between bg-card">
                <div>
                  <Badge variant="outline" className="mb-2 text-xs">
                    {currentSample.category}
                  </Badge>
                  <h3 className="text-lg font-bold mb-2">
                    {currentSample.title}
                  </h3>
                  
                  {/* Prompt Display */}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">AI Prompt Used:</p>
                    <div className="p-2 bg-muted/50 rounded-lg border">
                      <p className="text-xs italic">"{currentSample.prompt}"</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>Advanced AI-powered editing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>Instant results in seconds</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>No design experience needed</span>
                    </div>
                  </div>
                </div>

                {/* Navigation & CTA */}
                <div className="space-y-2">
                  {/* Carousel Navigation */}
                  <div className="flex items-center justify-center gap-2">
                    <Button onClick={prevSlide} variant="outline" size="icon" className="h-8 w-8 flex-shrink-0">
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    
                    <div className="flex gap-1.5 items-center min-w-[60px] justify-center">
                      {aiSamples.map((_, index) => <button key={index} onClick={() => {
                      setCurrentIndex(index);
                      setShowAfter(false);
                    }} className={`h-1 rounded-full transition-all flex-shrink-0 ${index === currentIndex ? "w-5 bg-primary" : "w-1 bg-muted-foreground/30"}`} aria-label={`Go to sample ${index + 1}`} />)}
                    </div>

                    <Button onClick={nextSlide} variant="outline" size="icon" className="h-8 w-8 flex-shrink-0">
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Buttons Row - Aligned */}
            <div className="grid md:grid-cols-[1.3fr_1fr] border-t">
              <div className="flex justify-center py-3">
                <Button onClick={() => setShowAfter(!showAfter)} variant="secondary" size="default">
                  {showAfter ? "Show Before" : "Show After"}
                </Button>
              </div>
              <div className="p-3 bg-card space-y-2">
                <Button asChild className="w-full" size="default">
                  <Link to="/pricing">
                    Try AI for Free
                  </Link>
                </Button>
                <p className="text-center text-[10px] text-muted-foreground">
                  Get 5 free AI tokens to explore
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-4">
        {/* Bottom Badge */}
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Powered by cutting-edge AI technology
          </p>
        </div>
      </div>
    </section>;
};