import Layout from "@/components/layout/Layout";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturesSection from "@/components/home/FeaturesSection";
import CtaSection from "@/components/home/CtaSection";

const Index = () => {
  return (
    <Layout
      title="Exhibit3Design - AI-Powered Exhibition Stand Design & Trade Show Solutions"
      description="Transform your trade show presence with AI-powered exhibition stand design. Professional custom booth designs, 3D visualization, and instant design iterations for exhibition designers and companies. From concept to reality."
      keywords="AI exhibition stand design, trade show booth design, AI-powered stand builder, exhibition stand designer, custom trade show displays, 3D exhibition visualization, modular exhibition stands, trade show design services, exhibition booth builder, stand design AI tool, exhibition design software, trade show marketing solutions"
      url="https://exhibit3design.com/"
    >
      <FeaturedProducts />
      <FeaturesSection />
      <CtaSection />
    </Layout>
  );
};

export default Index;
