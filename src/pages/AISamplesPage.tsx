import { useState, useEffect } from "react";
import { Sparkles, Calendar, Wand2, Users, Pencil, Video, ArrowRight, CheckCircle2, Image as ImageIcon, Film, RotateCw, UserPlus, Palette, Lightbulb, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { trackPageView } from "@/services/ga4Analytics";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";

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

interface DemoConfig {
  id: string;
  service_key: string;
  service_name: string;
  service_type: 'image' | 'video';
  mock_input_url: string;
  mock_output_url: string;
  mock_text_prompt?: string;
  is_active: boolean;
  display_order: number;
}

export default function AISamplesPage() {
  const [curatedSamples, setCuratedSamples] = useState<AICuratedSample[]>([]);
  const [demoConfigs, setDemoConfigs] = useState<DemoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [tryBeforeUseOpen, setTryBeforeUseOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [mockOutput, setMockOutput] = useState<string | null>(null);
  const [textPrompt, setTextPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('/ai-samples', 'AI Examples - Exhibition Design Gallery');
    fetchCuratedSamples();
    fetchDemoConfigs();
  }, []);

  const fetchDemoConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_demo_configs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setDemoConfigs((data || []) as DemoConfig[]);
    } catch (error) {
      console.error('Error fetching demo configs:', error);
    }
  };

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

  // Helper to get config for a service
  const getConfigForService = (serviceKey: string) => {
    return demoConfigs.find(c => c.service_key === serviceKey);
  };

  if (loading || demoConfigs.length === 0) {
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

  const imageServices = [
    {
      icon: UserPlus,
      title: "Adding Visitors",
      serviceKey: "adding_visitors",
      description: "Bring your exhibition stands to life by adding lifelike visitors and event attendees to your designs.",
      benefits: ["Natural crowd placement", "Diverse visitor types", "Realistic interactions"],
      color: "from-blue-500 to-cyan-500",
      aiStudioLink: "https://ai.exhibit3design.com/?service=add-visitors",
      mockImage: getConfigForService('adding_visitors')?.mock_input_url || "/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png",
      mockOutput: getConfigForService('adding_visitors')?.mock_output_url || "/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png"
    },
    {
      icon: Wand2,
      title: "Image Magic Edit",
      serviceKey: "image_magic_edit",
      description: "Intelligently modify layouts, colors, materials, and elements with simple text commands.",
      benefits: ["Instant modifications", "Smart suggestions", "Unlimited iterations"],
      color: "from-amber-500 to-orange-500",
      aiStudioLink: "https://ai.exhibit3design.com/?service=magic-edit",
      mockImage: getConfigForService('image_magic_edit')?.mock_input_url || "/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png",
      mockOutput: getConfigForService('image_magic_edit')?.mock_output_url || "/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png"
    },
    {
      icon: Pencil,
      title: "Image Artistic Mode",
      serviceKey: "image_artistic_mode",
      description: "Convert your booth designs into artistic pencil sketches or transform sketches into photorealistic renders.",
      benefits: ["Artistic visualization", "Client presentations", "Concept development"],
      color: "from-pink-500 to-rose-500",
      aiStudioLink: "https://ai.exhibit3design.com/?service=artistic-mode",
      mockImage: getConfigForService('image_artistic_mode')?.mock_input_url || "/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png",
      mockOutput: getConfigForService('image_artistic_mode')?.mock_output_url || "/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png"
    },
    {
      icon: Lightbulb,
      title: "Text to Image",
      serviceKey: "text_to_image",
      description: "Generate stunning exhibition stand visuals from text descriptions using advanced AI.",
      benefits: ["Instant generation", "Creative freedom", "Multiple variations"],
      color: "from-violet-500 to-purple-500",
      aiStudioLink: "https://ai.exhibit3design.com/?service=text-to-image",
      mockImage: getConfigForService('text_to_image')?.mock_input_url || "/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png",
      mockOutput: getConfigForService('text_to_image')?.mock_output_url || "/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png"
    }
  ];

  const videoServices = [
    {
      icon: Film,
      title: "Text or Image to Video",
      serviceKey: "text_image_to_video",
      description: "Transform static images or text prompts into dynamic video presentations of your exhibition designs.",
      benefits: ["Dynamic presentations", "Engaging content", "Easy sharing"],
      color: "from-green-500 to-emerald-500",
      aiStudioLink: "https://ai.exhibit3design.com/?service=text-image-to-video",
      mockImage: getConfigForService('text_image_to_video')?.mock_input_url || "/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png",
      mockOutput: getConfigForService('text_image_to_video')?.mock_output_url || "/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png"
    },
    {
      icon: RotateCw,
      title: "Rotating a Stand Video",
      serviceKey: "rotating_stand_video",
      description: "Create stunning 360° rotating videos that showcase your exhibition stand from every angle.",
      benefits: ["360° view", "Professional quality", "Client wow-factor"],
      color: "from-purple-500 to-indigo-500",
      aiStudioLink: "https://ai.exhibit3design.com/?service=rotating-stand",
      mockImage: getConfigForService('rotating_stand_video')?.mock_input_url || "/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png",
      mockOutput: getConfigForService('rotating_stand_video')?.mock_output_url || "/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png"
    },
    {
      icon: Users,
      title: "Visitors Walkthrough Video",
      serviceKey: "visitors_walkthrough_video",
      description: "Generate immersive walkthrough videos with realistic visitors exploring your exhibition space.",
      benefits: ["Immersive experience", "Realistic scenarios", "Marketing ready"],
      color: "from-cyan-500 to-blue-500",
      aiStudioLink: "https://ai.exhibit3design.com/?service=visitors-walkthrough",
      mockImage: getConfigForService('visitors_walkthrough_video')?.mock_input_url || "/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png",
      mockOutput: getConfigForService('visitors_walkthrough_video')?.mock_output_url || "/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png"
    }
  ];

  const handleTryService = (service: any) => {
    const config = getConfigForService(service.serviceKey);
    setSelectedService(service);
    setMockOutput(null);
    setTextPrompt(config?.mock_text_prompt || "");
    setUploadedImage(null);
    setTryBeforeUseOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMockGenerate = () => {
    // Simulate AI processing
    setTimeout(() => {
      setMockOutput(selectedService.mockOutput);
    }, 1500);
  };

  return (
    <Layout
      title="AI-Powered Exhibition Design Tools | Exhibit3Design"
      description="Discover AI tools that transform exhibition stand designs: 360° videos, realistic visitors, sketch conversions, and magic editing. See real examples."
      keywords="AI exhibition tools, 360 booth video, AI visitors, sketch to render, magic edit exhibition design"
    >
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section - Flat Design */}
        <section className="relative py-8 px-4 bg-gradient-to-br from-colorful-blue/5 via-colorful-teal/5 to-colorful-pink/5">
          <div className="container mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-colorful-blue/10 text-colorful-blue mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Design Tools</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">
              Transform Exhibition Designs with AI
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All-in-one AI suite for rotating videos, visitor scenes, sketches, and instant edits.
            </p>
          </div>
        </section>

        {/* See AI in Action - Flat Design */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Eye className="h-4 w-4" />
              Real Examples
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
              See AI in Action
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
              Real transformations. Hover to see source images.
            </p>

            {/* Real AI Examples Gallery */}
            <div className="max-w-7xl mx-auto">
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
                <>
                  {/* Mobile: Carousel view */}
                  <div className="md:hidden">
                    <div className="relative max-w-full mx-auto mb-8 px-4">
                      <BeforeAfterSlider
                        beforeImage={curatedSamples[currentSlideIndex]?.before_image_url}
                        afterImage={curatedSamples[currentSlideIndex]?.after_image_url}
                        beforeVideo={curatedSamples[currentSlideIndex]?.before_video_url}
                        afterVideo={curatedSamples[currentSlideIndex]?.after_video_url}
                        mode={curatedSamples[currentSlideIndex]?.mode_label || ""}
                      />
                      
                      {/* Navigation arrows */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/80 hover:bg-background/90 backdrop-blur-sm border"
                        onClick={() => setCurrentSlideIndex((prev) => 
                          prev === 0 ? curatedSamples.length - 1 : prev - 1
                        )}
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/80 hover:bg-background/90 backdrop-blur-sm border"
                        onClick={() => setCurrentSlideIndex((prev) => 
                          prev === curatedSamples.length - 1 ? 0 : prev + 1
                        )}
                        aria-label="Next slide"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Dots indicator */}
                    {curatedSamples.length > 1 && (
                      <div className="flex justify-center items-center gap-3 mt-4">
                        {curatedSamples.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlideIndex(index)}
                            style={{ 
                              width: '10px', 
                              height: '10px',
                              minWidth: '10px',
                              minHeight: '10px'
                            }}
                            className={`rounded-full transition-all flex-shrink-0 ${
                              index === currentSlideIndex
                                ? "bg-primary"
                                : "bg-muted-foreground/40"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Desktop: Grid view */}
                  <div className="hidden md:grid md:grid-cols-2 gap-8">
                    {curatedSamples.map((sample) => (
                      <BeforeAfterSlider
                        key={sample.id}
                        beforeImage={sample.before_image_url}
                        afterImage={sample.after_image_url}
                        beforeVideo={sample.before_video_url}
                        afterVideo={sample.after_video_url}
                        mode={sample.mode_label}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Three Core Pillars Story - Flat Design */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Complete Exhibition Design Journey</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From ready-made 3D files to AI-powered enhancements, we provide everything you need to create stunning exhibition stands
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-colorful-blue transition-colors bg-gradient-to-br from-colorful-blue/5 to-transparent">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-colorful-blue/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-colorful-blue" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Generate</h3>
                  <p className="text-muted-foreground mb-4">
                    Start with professional, ready-made 3D design files created by exhibition experts. No design experience needed.
                  </p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-colorful-blue mt-0.5 flex-shrink-0" />
                      <span>Industry-standard 3D files</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-colorful-blue mt-0.5 flex-shrink-0" />
                      <span>Professional stand designs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-colorful-blue mt-0.5 flex-shrink-0" />
                      <span>Instant download access</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-colorful-teal transition-colors bg-gradient-to-br from-colorful-teal/5 to-transparent">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-colorful-teal/10 flex items-center justify-center mx-auto mb-4">
                    <Video className="h-8 w-8 text-colorful-teal" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Visualize</h3>
                  <p className="text-muted-foreground mb-4">
                    Transform static designs into dynamic presentations with rotating videos, visitors' walkthroughs, and pencil sketches, magic edits.
                  </p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-colorful-teal mt-0.5 flex-shrink-0" />
                      <span>Rotating stand videos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-colorful-teal mt-0.5 flex-shrink-0" />
                      <span>Realistic visitor walkthroughs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-colorful-teal mt-0.5 flex-shrink-0" />
                      <span>Professional realism</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-colorful-orange transition-colors bg-gradient-to-br from-colorful-orange/5 to-transparent">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-colorful-orange/10 flex items-center justify-center mx-auto mb-4">
                    <Palette className="h-8 w-8 text-colorful-orange" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Customize</h3>
                  <p className="text-muted-foreground mb-4">
                    Fine-tune every detail with AI Magic Edit, artistic modes, and smart visitor placement for trade-show perfect results.
                  </p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-colorful-orange mt-0.5 flex-shrink-0" />
                      <span>Magic Edit with text prompt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-colorful-orange mt-0.5 flex-shrink-0" />
                      <span>Pencil sketch artistic style</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-colorful-orange mt-0.5 flex-shrink-0" />
                      <span>Exhibition-Focused AI</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Value Proposition - Flat Design */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose AI-Powered Design?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Save time, reduce costs, and deliver stunning exhibition designs that win clients
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "10x Faster", description: "Generate variations and modifications in seconds instead of hours", color: "pink" },
                { title: "Cost Effective", description: "Reduce design iteration costs by up to 90% with AI assistance", color: "green" },
                { title: "Exhibition-Focused AI", description: "AI for exhibition design — flawless results, no prompt hassle.", color: "blue" }
              ].map((item, idx) => (
                <Card key={idx} className={`border-2 transition-colors ${
                  item.color === 'pink' ? 'hover:border-colorful-pink bg-gradient-to-br from-colorful-pink/5 to-transparent' : 
                  item.color === 'green' ? 'hover:border-colorful-green bg-gradient-to-br from-colorful-green/5 to-transparent' : 
                  'hover:border-colorful-blue bg-gradient-to-br from-colorful-blue/5 to-transparent'
                }`}>
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className={`h-10 w-10 mx-auto mb-3 ${
                      item.color === 'pink' ? 'text-colorful-pink' : 
                      item.color === 'green' ? 'text-colorful-green' : 
                      'text-colorful-blue'
                    }`} />
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Image AI Services - Flat Design */}
        <section className="py-12 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <ImageIcon className="h-4 w-4" />
                Image Tools
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Powerful Image AI Tools</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform and enhance your exhibition stand images with cutting-edge AI technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {imageServices.map((service, idx) => {
                const Icon = service.icon;
                const colorClasses = [
                  { bg: 'bg-gradient-to-br from-colorful-pink/5 to-transparent', text: 'text-colorful-pink', border: 'hover:border-colorful-pink' },
                  { bg: 'bg-gradient-to-br from-colorful-blue/5 to-transparent', text: 'text-colorful-blue', border: 'hover:border-colorful-blue' },
                  { bg: 'bg-gradient-to-br from-colorful-teal/5 to-transparent', text: 'text-colorful-teal', border: 'hover:border-colorful-teal' },
                  { bg: 'bg-gradient-to-br from-colorful-orange/5 to-transparent', text: 'text-colorful-orange', border: 'hover:border-colorful-orange' }
                ];
                const colors = colorClasses[idx % colorClasses.length];
                return (
                  <Card key={idx} className={`border-2 ${colors.border} transition-colors ${colors.bg}`}>
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {service.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        {service.benefits.map((benefit, bidx) => (
                          <div key={bidx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className={`h-4 w-4 ${colors.text} flex-shrink-0`} />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTryService(service)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Try Before Use
                        </Button>
                        <Button 
                          asChild 
                          size="sm"
                        >
                          <Link to={service.aiStudioLink}>
                            Use Now <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Video AI Services - Flat Design */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Film className="h-4 w-4" />
                Video Tools
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Dynamic Video AI Tools</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create engaging video content that brings your exhibition designs to life
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {videoServices.map((service, idx) => {
                const Icon = service.icon;
                const colorClasses = [
                  { bg: 'bg-gradient-to-br from-colorful-green/5 to-transparent', text: 'text-colorful-green', border: 'hover:border-colorful-green' },
                  { bg: 'bg-gradient-to-br from-colorful-pink/5 to-transparent', text: 'text-colorful-pink', border: 'hover:border-colorful-pink' },
                  { bg: 'bg-gradient-to-br from-colorful-blue/5 to-transparent', text: 'text-colorful-blue', border: 'hover:border-colorful-blue' }
                ];
                const colors = colorClasses[idx % colorClasses.length];
                return (
                  <Card key={idx} className={`border-2 ${colors.border} transition-colors ${colors.bg}`}>
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {service.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        {service.benefits.map((benefit, bidx) => (
                          <div key={bidx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className={`h-4 w-4 ${colors.text} flex-shrink-0`} />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                       <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTryService(service)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Try
                        </Button>
                        <Button 
                          asChild 
                          size="sm"
                        >
                          <a href={service.aiStudioLink} target="_blank" rel="noopener noreferrer">
                            Use Now <ArrowRight className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>


        {/* CTA Section - Flat Design */}
        <section className="py-12 px-4 bg-gradient-to-r from-colorful-pink/5 via-colorful-blue/5 to-colorful-teal/5">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-colorful-blue hover:border-colorful-pink transition-colors">
              <CardContent className="p-8 md:p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-colorful-blue" />
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to Transform Your Designs?</h2>
                <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Start with 2 free AI tokens. Experience the power of AI-driven exhibition design today.
                </p>
                <Button asChild size="lg" className="bg-colorful-blue hover:bg-colorful-blue/90">
                  <Link to="/pricing">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Try Before Use Dialog */}
      <Dialog open={tryBeforeUseOpen} onOpenChange={setTryBeforeUseOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto px-4 sm:px-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Try: {selectedService?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                This is a demo preview. Sign up to use the real AI tool with your own images.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  {(selectedService?.serviceKey === 'text_to_image' || selectedService?.serviceKey === 'text_image_to_video') ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <p className="text-xs sm:text-sm font-semibold mb-2">Text Prompt</p>
                        <div className="w-full min-h-24 sm:min-h-32 p-2 sm:p-3 border-2 rounded-lg bg-muted/50 text-foreground text-xs sm:text-sm">
                          {textPrompt || "No prompt available"}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold mb-2 text-muted-foreground">Or Upload Reference Image (Optional)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled
                          className="w-full p-2 border-2 rounded-lg bg-muted cursor-not-allowed opacity-50 text-xs sm:text-sm"
                        />
                        {uploadedImage && (
                          <img 
                            src={uploadedImage} 
                            alt="Uploaded reference"
                            className="mt-2 sm:mt-3 w-full h-32 sm:h-40 object-cover rounded-lg border-2"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold mb-2">Input Image (Sample)</p>
                      <img 
                        src={selectedService?.mockImage} 
                        alt="Sample input" 
                        className="w-full max-w-full rounded-lg border-2 object-contain"
                      />
                    </>
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold mb-2">
                    {mockOutput ? "Generated Output" : "Output Preview"}
                  </p>
                  {mockOutput ? (
                    selectedService?.serviceKey === 'text_image_to_video' || 
                    selectedService?.serviceKey === 'rotating_stand_video' || 
                    selectedService?.serviceKey === 'visitors_walkthrough_video' ? (
                      <video 
                        src={mockOutput} 
                        controls
                        autoPlay
                        loop
                        muted
                        className="w-full max-w-full rounded-lg border-2 border-primary"
                      />
                    ) : (
                      <img 
                        src={mockOutput} 
                        alt="Generated output" 
                        className="w-full max-w-full rounded-lg border-2 border-primary object-contain"
                      />
                    )
                  ) : (
                    <div className="w-full aspect-video bg-muted rounded-lg border-2 border-dashed flex items-center justify-center p-4">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center">Click Generate to see result</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              {!mockOutput ? (
                <>
                  <Button onClick={handleMockGenerate} size="default" className="w-full sm:w-auto">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-sm sm:text-base">Generate (Demo)</span>
                  </Button>
                  <Button asChild size="default" variant="outline" className="w-full sm:w-auto">
                    <a href={selectedService?.aiStudioLink || "https://ai.exhibit3design.com"} target="_blank" rel="noopener noreferrer">
                      <span className="text-sm sm:text-base">Use Now in AI Studio</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                    </a>
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate('/pricing')} size="default" className="w-full sm:w-auto">
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-sm sm:text-base">Get Started Free</span>
                  </Button>
                  <Button asChild size="default" variant="outline" className="w-full sm:w-auto">
                    <a href={selectedService?.aiStudioLink || "https://ai.exhibit3design.com"} target="_blank" rel="noopener noreferrer">
                      <span className="text-sm sm:text-base">Use Now in AI Studio</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}