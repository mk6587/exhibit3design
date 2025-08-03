
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturesSection from "@/components/home/FeaturesSection";
import CtaSection from "@/components/home/CtaSection";
import CheckoutDebug from "@/components/CheckoutDebug";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProducts />
      <FeaturesSection />
      <CtaSection />
      
      {/* Temporary debug tool for QA testing */}
      <div className="container mx-auto px-4 py-12">
        <CheckoutDebug />
      </div>
    </Layout>
  );
};

export default Index;
