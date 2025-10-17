import Layout from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProductsGrid } from "@/components/home/FeaturedProductsGrid";
import FeaturesSection from "@/components/home/FeaturesSection";
import CtaSection from "@/components/home/CtaSection";
import { AIShowcaseSection } from "@/components/home/AIShowcaseSection";

const Index = () => {
  return (
    <Layout
      title="Exhibit3Design - AI-Powered Exhibition Stand Design Platform"
      description="Transform exhibition stands instantly with AI. Upload your sketch, get photorealistic renders, 360° walkthroughs & presentation-ready visuals. No design experience needed."
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
