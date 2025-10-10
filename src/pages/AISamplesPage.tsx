import { useState, useEffect } from "react";
import { Sparkles, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIGenerationCard } from "@/components/ai/AIGenerationCard";

interface AIGeneration {
  id: string;
  prompt: string;
  service_type: string;
  input_image_url: string | null;
  output_image_url: string;
  tokens_used: number;
  created_at: string;
}

export default function AISamplesPage() {
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchGenerations();
  }, [user]);

  const fetchGenerations = async () => {
    try {
      if (user) {
        // Fetch user's AI generation history
        const { data, error } = await supabase
          .from('ai_generation_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGenerations(data || []);
      } else {
        // Fetch public AI samples for non-authenticated users
        const { data, error } = await supabase
          .from('ai_edit_samples')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        
        // Transform ai_edit_samples to match AIGeneration interface
        const transformedData: AIGeneration[] = (data || []).map((sample: any) => ({
          id: sample.id,
          prompt: sample.prompt_used || 'AI transformation',
          service_type: sample.category || 'ai_edit',
          input_image_url: sample.before_image_url,
          output_image_url: sample.after_image_url,
          tokens_used: 1,
          created_at: sample.created_at
        }));
        
        setGenerations(transformedData);
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
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Layout
        title="My AI History | Exhibit3Design"
        description="View your AI-powered design generation history and results."
        keywords="AI history, generated designs, AI results"
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
      title="My AI History | Exhibit3Design"
      description="View your AI-powered design generation history and results."
      keywords="AI history, generated designs, AI results"
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
            {generations.length === 0 ? (
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
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}