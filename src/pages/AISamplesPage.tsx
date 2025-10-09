import { useState, useEffect } from "react";
import { Sparkles, Grid3x3, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAfter, setShowAfter] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSamples();
  }, [selectedCategory]);

  const fetchSamples = async () => {
    try {
      let query = supabase
        .from('ai_edit_samples')
        .select('*')
        .order('display_order', { ascending: true });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSamples(data || []);
    } catch (error) {
      console.error('Error fetching AI samples:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Examples' },
    { value: 'color_change', label: 'Color Changes' },
    { value: 'style_transfer', label: 'Style Transfer' },
    { value: 'render_quality', label: 'Render Quality' },
    { value: 'material_update', label: 'Material Updates' },
    { value: 'video_creation', label: 'Video Creation' }
  ];

  const toggleImage = (sampleId: string) => {
    setShowAfter(prev => ({
      ...prev,
      [sampleId]: !prev[sampleId]
    }));
  };

  return (
    <Layout
      title="AI Examples - See What's Possible | Exhibit3Design"
      description="Browse real examples of AI-powered exhibition stand design transformations. See before and after comparisons using Runware AI tools."
      keywords="AI design examples, exhibition stand AI, design transformation, AI editing samples"
    >
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI Showcase</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              See AI in Action
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Real examples of instant design transformations powered by Runware Gemini Flash 2.5 and Kling 2.5 Turbo Pro
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Samples Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading AI examples...</p>
              </div>
            ) : samples.length === 0 ? (
              <div className="text-center py-12">
                <Grid3x3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No examples found in this category yet.</p>
                <Button
                  onClick={() => setSelectedCategory('all')}
                  variant="outline"
                  className="mt-4"
                >
                  View All Examples
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {samples.map((sample) => (
                  <Card key={sample.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          src={showAfter[sample.id] ? sample.after_image_url : sample.before_image_url}
                          alt={sample.title}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                        <Badge 
                          className="absolute top-3 left-3"
                          variant={showAfter[sample.id] ? "default" : "secondary"}
                        >
                          {showAfter[sample.id] ? "After" : "Before"}
                        </Badge>
                        
                        {sample.is_featured && (
                          <Badge className="absolute top-3 right-3 bg-amber-500">
                            Featured
                          </Badge>
                        )}

                        {/* Toggle Button Overlay */}
                        <Button
                          onClick={() => toggleImage(sample.id)}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          size="sm"
                        >
                          {showAfter[sample.id] ? "Show Before" : "Show After"}
                        </Button>
                      </div>

                      {/* Info Section */}
                      <div className="p-5">
                        <Badge variant="outline" className="mb-3">
                          {sample.category.replace('_', ' ')}
                        </Badge>
                        <h3 className="font-bold text-lg mb-2">
                          {sample.title}
                        </h3>
                        {sample.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {sample.description}
                          </p>
                        )}
                        
                        {/* Prompt Display */}
                        {sample.prompt_used && (
                          <div className="p-3 bg-muted/50 rounded-lg border text-xs">
                            <p className="font-medium mb-1 text-muted-foreground">
                              Prompt:
                            </p>
                            <p className="italic">"{sample.prompt_used}"</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to Try AI Yourself?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get 5 free AI tokens and start transforming exhibition stand designs instantly
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/pricing">Get 5 Free Tokens</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/products">Browse Designs</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
