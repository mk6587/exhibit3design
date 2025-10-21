import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProductsGrid } from "@/components/home/FeaturedProductsGrid";
import FeaturesSection from "@/components/home/FeaturesSection";
import CtaSection from "@/components/home/CtaSection";
import { AIShowcaseSection } from "@/components/home/AIShowcaseSection";
import { trackPageView } from "@/services/ga4Analytics";

const Index = () => {
  useEffect(() => {
    trackPageView('/', 'Home - AI Exhibition Stand Design');
  }, []);

  return (
    <Layout
      title="Exhibition Stand Design AI | 3D Booth Downloads & 360° Videos | Exhibit3Design"
      description="Professional exhibition stand designs enhanced with AI. Get ready-made 3D booth files (SKP, 3DS) and transform them with AI: 360° rotating videos, realistic visitors, photorealistic renders, and Magic Edit customization. Instant results, no design experience needed."
      keywords="exhibition stand design, AI exhibition design, 3D booth design, trade show booth ideas, exhibition stand design ideas, creative exhibition stand, booth concept design, 3D stand design, custom trade show stand, modern exhibition booth, AI-powered booth design, 360 booth video, rotating stand video, exhibition stand planning, photorealistic exhibition renders, AI booth rendering, instant exhibition design, exhibition design automation, booth layout ideas, trade show design tools, exhibition stand mockups, AI stand visualization, booth design templates, exhibition AI tools, sketch to render, magic edit booth design, exhibition stand renderings, booth architecture ideas, event booth concepts, stand design inspiration, exhibition design 2025, downloadable booth designs"
      url="https://exhibit3design.com/"
    >
      <HeroSection />
      <AIShowcaseSection />
      <FeaturedProductsGrid />
      <FeaturesSection />
      <CtaSection />
    </Layout>
  );
};

export default Index;
