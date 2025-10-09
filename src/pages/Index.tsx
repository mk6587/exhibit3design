import Layout from "@/components/layout/Layout";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturesSection from "@/components/home/FeaturesSection";
import CtaSection from "@/components/home/CtaSection";
import { AIShowcaseSection } from "@/components/home/AIShowcaseSection";

const Index = () => {
  return (
    <Layout
      title="Exhibit3Design - Design Faster with Ready-Made Files & AI Tools"
      description="Skip the blank canvas. Access professional exhibition stand designs and customize them instantly with AI. Get 5 free AI tokens to try."
      keywords="exhibition stands, AI design tools, trade show templates, exhibition design subscription"
      url="https://exhibit3design.com/"
    >
      <FeaturedProducts />
      <AIShowcaseSection />
      <FeaturesSection />
      <CtaSection />
    </Layout>
  );
};

export default Index;
