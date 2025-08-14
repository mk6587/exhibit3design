
import Layout from "@/components/layout/Layout";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturesSection from "@/components/home/FeaturesSection";
import CtaSection from "@/components/home/CtaSection";
import CheckoutDebug from "@/components/CheckoutDebug";

const Index = () => {
  return (
    <Layout
      title="Exhibit3Design - Premium Exhibition Stand Design Services"
      description="Professional exhibition stand design and custom services. Modern, innovative designs for trade shows and exhibitions. From economy to premium options."
      keywords="exhibition stand design, trade show booth, custom exhibition design, exhibition services, stand builder, trade show design"
      url="https://exhibit3design.com/"
    >
      <FeaturedProducts />
      <FeaturesSection />
      <CtaSection />
      
      {/* Temporary debug tool for QA testing */}
      <div className="container mx-auto px-4 py-12">
      {/* Debug tool temporarily removed for production */}
      {/* <CheckoutDebug /> */}
      </div>
    </Layout>
  );
};

export default Index;
