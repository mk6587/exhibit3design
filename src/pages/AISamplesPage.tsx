import { useState, useEffect } from "react";
import { Sparkles, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIGenerationCard } from "@/components/ai/AIGenerationCard";
import { trackPageView } from "@/services/ga4Analytics";

interface AIGeneration {
  id: string;
  prompt: string;
  service_type: string;
  input_image_url: string | null;
  output_image_url: string;
  tokens_used: number;
  created_at: string;
}

interface AICuratedSample {
  id: string;
  name: string;
  mode_label: string;
  type: 'image' | 'video';
  before_image_url?: string;
  after_image_url?: string;
  before_video_url?: string;
  after_video_url?: string;
  created_at: string;
}

export default function AISamplesPage() {
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [curatedSamples, setCuratedSamples] = useState<AICuratedSample[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    trackPageView('/ai-samples', 'AI Examples - Exhibition Design Gallery');
    fetchGenerations();
    fetchCuratedSamples();
  }, [user]);

  const fetchCuratedSamples = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_samples')
        .select('*')
        .eq('is_active', true)
        .eq('show_on_samples_page', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCuratedSamples((data || []) as AICuratedSample[]);
    } catch (error) {
      console.error('Error fetching curated samples:', error);
    }
  };

  const fetchGenerations = async () => {
    try {
      if (user) {
        // Authenticated users: fetch their own history + public samples
        const { data, error } = await supabase
          .from('ai_generation_history')
          .select('*')
          .or(`user_id.eq.${user.id},is_public_sample.eq.true`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGenerations(data || []);
      } else {
        // Non-authenticated users: fetch only public samples
        const { data, error } = await supabase
          .from('ai_generation_history')
          .select('*')
          .eq('is_public_sample', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGenerations(data || []);
      }
    } catch (error) {
      console.error('Error fetching AI generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatServiceType = (type: string) => {
    // Map service types to AI Studio service names
    const serviceTypeMap: Record<string, string> = {
      'animation': 'Rotating Stand Video',
      'image_generation': 'Image Generation',
      'image_edit': 'Image Magic Edit',
      'style_transfer': 'Image Artistic Mode',
      'video_generation': 'Visitors Walkthrough Video',
      'ai_edit': 'Image Magic Edit'
    };
    
    return serviceTypeMap[type] || type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Layout
      title="AI-Powered Exhibition Design History | Exhibit3Design"
      description="View your AI-generated exhibition designs, 360° walkthroughs, and instant transformations. Track all your AI-powered design creations."
      keywords="AI design history, generated exhibition designs, AI transformation results, 360 walkthrough history"
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your AI generations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="AI-Powered Exhibition Design History | Exhibit3Design"
      description="View your AI-generated exhibition designs, 360° walkthroughs, and instant transformations. Track all your AI-powered design creations."
      keywords="AI design history, generated exhibition designs, AI transformation results, 360 walkthrough history"
    >
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="py-12 px-4 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto max-w-6xl text-center">
            <Badge className="mb-4" variant="outline">
              <Sparkles className="h-3 w-3 mr-1" />
              {user ? 'AI Generation History' : 'AI Examples'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {user ? 'Your AI Creations' : 'AI-Powered Transformations'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {user 
                ? 'Browse all your AI-generated designs and transformations'
                : 'See how AI can transform exhibition stand designs'
              }
            </p>
          </div>
        </section>

        {/* Grid Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            {generations.length === 0 && curatedSamples.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {user ? 'No generations yet' : 'No examples available'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {user 
                    ? 'Start creating AI designs to see them here'
                    : 'Check back soon for AI transformation examples'
                  }
                </p>
                <Button asChild>
                  <Link to="/products">Browse Designs</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Curated Samples Section */}
                {curatedSamples.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-primary" />
                      Featured Examples
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {curatedSamples.map((sample) => (
                        <Card key={sample.id} className="overflow-hidden">
                          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                            {sample.type === 'video' && sample.after_video_url ? (
                              <video
                                src={sample.after_video_url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                                autoPlay
                              />
                            ) : (
                              <img
                                src={sample.after_image_url}
                                alt={sample.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            )}
                            <Badge 
                              className="absolute top-3 left-3 backdrop-blur-sm shadow-lg bg-purple-600 text-white border-purple-600"
                            >
                              Featured
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(sample.created_at)}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {sample.mode_label}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Generations Section */}
                {generations.length > 0 && (
                  <div>
                    {curatedSamples.length > 0 && (
                      <h2 className="text-2xl font-bold mb-6">
                        {user ? 'Your Generations' : 'Community Examples'}
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {generations.map((generation) => (
                        <AIGenerationCard
                          key={generation.id}
                          generation={generation}
                          formatDate={formatDate}
                          formatServiceType={formatServiceType}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}