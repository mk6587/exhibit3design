import { useState, useEffect } from "react";
import { Sparkles, Calendar, Wand2, Users, Pencil, Video, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { trackPageView } from "@/services/ga4Analytics";

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
  const [curatedSamples, setCuratedSamples] = useState<AICuratedSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSampleId, setHoveredSampleId] = useState<string | null>(null);

  useEffect(() => {
    trackPageView('/ai-samples', 'AI Examples - Exhibition Design Gallery');
    fetchCuratedSamples();
  }, []);

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

  const services = [
    {
      icon: Video,
      title: "360° Rotating Videos",
      description: "Transform static booth images into dynamic 360° walkthroughs that showcase your design from every angle.",
      benefits: ["Instant video generation", "Professional quality", "Multiple viewing angles"],
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Users,
      title: "Add Realistic Visitors",
      description: "Bring your exhibition stands to life by adding lifelike visitors and event attendees to your designs.",
      benefits: ["Natural crowd placement", "Diverse visitor types", "Realistic interactions"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Pencil,
      title: "Sketch to Render",
      description: "Convert your booth designs into artistic pencil sketches or transform sketches into photorealistic renders.",
      benefits: ["Artistic visualization", "Client presentations", "Concept development"],
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Wand2,
      title: "Magic Edit",
      description: "Intelligently modify layouts, colors, materials, and elements with simple text commands.",
      benefits: ["Instant modifications", "Smart suggestions", "Unlimited iterations"],
      color: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <Layout
      title="AI-Powered Exhibition Design Tools | Exhibit3Design"
      description="Discover AI tools that transform exhibition stand designs: 360° videos, realistic visitors, sketch conversions, and magic editing. See real examples."
      keywords="AI exhibition tools, 360 booth video, AI visitors, sketch to render, magic edit exhibition design"
    >
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background"></div>
          <div className="container mx-auto max-w-6xl text-center relative z-10">
            <Badge className="mb-6 text-base px-4 py-2" variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Design Tools
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
              Transform Exhibition Designs with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Professional AI tools that bring your exhibition stands to life. Generate 360° videos, add realistic visitors, create artistic sketches, and edit designs instantly — all powered by advanced AI technology.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/products">
                  Explore Designs <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose AI-Powered Design?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Save time, reduce costs, and deliver stunning exhibition designs that win clients
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "10x Faster", description: "Generate variations and modifications in seconds instead of hours" },
                { title: "Cost Effective", description: "Reduce design iteration costs by up to 90% with AI assistance" },
                { title: "Client Ready", description: "Create presentation-ready materials instantly with professional quality" }
              ].map((item, idx) => (
                <Card key={idx} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="outline">
                <Wand2 className="h-3 w-3 mr-1" />
                AI Services
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful AI Tools at Your Fingertips</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Each service is designed to streamline your workflow and deliver exceptional results
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <Card key={idx} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="space-y-2">
                        {service.benefits.map((benefit, bidx) => (
                          <div key={bidx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI Examples Grid */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="outline">
                <Sparkles className="h-3 w-3 mr-1" />
                Real Examples
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">See AI in Action</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore real transformations created with our AI tools. Hover to see the source images.
              </p>
            </div>

            {curatedSamples.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No examples available</h3>
                <p className="text-muted-foreground mb-6">
                  Check back soon for AI transformation examples
                </p>
                <Button asChild>
                  <Link to="/products">Browse Designs</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curatedSamples.map((sample) => {
                  const isHovered = hoveredSampleId === sample.id;
                  const displayImage = (isHovered && sample.before_image_url) 
                    ? sample.before_image_url 
                    : sample.after_image_url;
                  const isVideo = sample.type === 'video';

                  return (
                    <Card 
                      key={sample.id} 
                      className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                      onMouseEnter={() => setHoveredSampleId(sample.id)}
                      onMouseLeave={() => setHoveredSampleId(null)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {isVideo && sample.after_video_url && !isHovered ? (
                          <video
                            src={sample.after_video_url}
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                            muted
                            loop
                            playsInline
                            autoPlay
                          />
                        ) : (
                          <img
                            src={displayImage}
                            alt={isHovered && sample.before_image_url ? "Source image" : sample.name}
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        )}
                        <Badge 
                          className="absolute top-3 left-3 backdrop-blur-sm shadow-lg transition-all duration-300 bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                        >
                          {isHovered && sample.before_image_url ? "Source" : "AI Result"}
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
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardContent className="p-12 text-center">
                <Sparkles className="h-16 w-16 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Designs?</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Start with 5 free AI tokens. Experience the power of AI-driven exhibition design today.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link to="/pricing">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg px-8">
                    <Link to="/products">View Templates</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}