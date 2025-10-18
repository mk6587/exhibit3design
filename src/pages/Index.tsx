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
      title="Exhibit3Design - AI-Powered Exhibition Stand Design Platform"
      description="Get a ready-made exhibition design file and enhance it with AI — rotating videos, visitors, sketches, and Magic Edit tools."
      keywords="AI exhibition design, AI stand design, 360 walkthrough generator, exhibition AI tools, trade show AI rendering, sketch to render AI, exhibition design automation"
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
