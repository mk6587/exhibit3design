import { useState, useEffect } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface AISample {
  id: string;
  title: string;
  description: string;
  before_image_url: string;
  after_image_url: string;
  prompt_used: string;
  category: string;
  is_featured: boolean;
}

export default function AISamplesPage() {
  const [samples, setSamples] = useState<AISample[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_edit_samples')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSamples(data || []);
    } catch (error) {
      console.error('Error fetching AI samples:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentSample = samples[currentIndex];

  const nextSample = () => {
    setCurrentIndex((prev) => (prev + 1) % samples.length);
    setShowAfter(false);
  };

  const prevSample = () => {
    setCurrentIndex((prev) => (prev - 1 + samples.length) % samples.length);
    setShowAfter(false);
  };

  if (loading) {
    return (
      <Layout
        title="AI Examples - See What's Possible | Exhibit3Design"
        description="Browse real examples of AI-powered exhibition stand design transformations. See before and after comparisons using Runware AI tools."
        keywords="AI design examples, exhibition stand AI, design transformation, AI editing samples"
      >
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading AI examples...</p>
        </div>
      </Layout>
    );
  }

  if (samples.length === 0) {
    return (
      <Layout
        title="AI Examples - See What's Possible | Exhibit3Design"
        description="Browse real examples of AI-powered exhibition stand design transformations. See before and after comparisons using Runware AI tools."
        keywords="AI design examples, exhibition stand AI, design transformation, AI editing samples"
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No examples available yet.</p>
            <Button asChild variant="outline">
              <Link to="/products">Browse Designs</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="AI Examples - See What's Possible | Exhibit3Design"
      description="Browse real examples of AI-powered exhibition stand design transformations. See before and after comparisons using Runware AI tools."
      keywords="AI design examples, exhibition stand AI, design transformation, AI editing samples"
    >
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <section className="py-12 px-4 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto max-w-6xl text-center">
            <Badge className="mb-4" variant="outline">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Editing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI Transforms Your Designs
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Instantly customize exhibition stands with simple text prompts. No design skills needed.
            </p>
          </div>
        </section>

        {/* Before/After Comparison */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Left: Image */}
              <div className="space-y-4">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted shadow-xl">
                  <img
                    src={showAfter ? currentSample.after_image_url : currentSample.before_image_url}
                    alt={currentSample.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    className="absolute top-4 left-4 text-sm"
                    variant={showAfter ? "default" : "secondary"}
                  >
                    {showAfter ? "After" : "Before"}
                  </Badge>
                </div>
                
                <Button
                  onClick={() => setShowAfter(!showAfter)}
                  variant="outline"
                  size="lg"
                  className="w-full max-w-xs mx-auto block"
                >
                  {showAfter ? "Show Before" : "Show After"}
                </Button>
              </div>

              {/* Right: Details */}
              <div className="space-y-6">
                <div>
                  <Badge variant="outline" className="mb-3">
                    {currentSample.category.replace('_', ' ')}
                  </Badge>
                  <h2 className="text-3xl font-bold mb-4">
                    {currentSample.title}
                  </h2>
                </div>

                {/* Prompt Used */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    AI Prompt Used:
                  </p>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="italic text-sm">
                      "{currentSample.prompt_used}"
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Advanced AI-powered editing</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Instant results in seconds</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">No design experience needed</p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6">
                  <Button
                    onClick={prevSample}
                    variant="outline"
                    size="icon"
                    disabled={samples.length <= 1}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <div className="flex gap-2">
                    {samples.map((_, index) => (
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
                        aria-label={`Go to example ${index + 1}`}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={nextSample}
                    variant="outline"
                    size="icon"
                    disabled={samples.length <= 1}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center shadow-2xl">
              <h2 className="text-3xl font-bold mb-4">
                Try AI for Free
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Get 5 free AI tokens to explore
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/pricing">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/products">Browse Designs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
