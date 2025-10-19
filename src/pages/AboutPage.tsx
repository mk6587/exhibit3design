import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { trackPageView } from "@/services/ga4Analytics";

const AboutPage = () => {
  useEffect(() => {
    trackPageView('/about', 'About Us - Our Story');
  }, []);

  return <Layout
      title="About AI-Powered Exhibition Design Platform | Exhibit3Design"
      description="Professional exhibition stand designs enhanced with AI. Instant photorealistic renders, 360° walkthroughs, and style transformations powered by advanced AI technology."
      keywords="AI exhibition design platform, AI-powered trade show design, exhibition AI tools, about exhibit3design"
      url="https://exhibit3design.com/about"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About Exhibit3Design</h1>
          
          <div className="aspect-video bg-secondary mb-8 rounded-lg overflow-hidden">
            <img src="/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png" alt="Exhibition stand design" className="w-full h-full object-cover" />
          </div>
          
          <div className="prose max-w-none">
            <p className="lead text-lg mb-6">
              Exhibit3Design is an AI-powered platform built for the exhibition stand design industry.
              We offer a curated collection of ready-made professional stand designs that you can instantly enhance with powerful AI tools — such as rotating videos, realistic visitors, artistic sketch rendering, and Magic Edit customization.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">What We Offer</h2>
            <p>
              Our platform combines AI creativity with real-world design expertise.
              Each ready-made design is optimized for practical exhibition use, featuring balanced layouts, clean aesthetics, and functional spaces for product display, interaction, and meetings.
              You can preview, customize, and visualize your booth with AI before production — no endless prompting or trial and error.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Why It's Different</h2>
            <p>
              Unlike traditional design libraries, Exhibit3Design uses AI trained specifically for exhibition design, removing the hassle of multiple tweaks and generic outputs.
              You get accurate, presentation-ready visuals that align with trade show standards — instantly.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Who Benefits</h2>
            <p>
              Our platform is built for everyone in the exhibition ecosystem:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Exhibition contractors</strong> who need fast, professional concepts for client projects</li>
              <li><strong>Design professionals</strong> seeking AI-assisted creativity and quick visualizations</li>
              <li><strong>Marketing teams</strong> that want cost-effective booth designs for upcoming shows</li>
              <li><strong>Small businesses</strong> looking for high-quality stands without custom design costs</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">File Formats and Customization</h2>
            <p>
              Each purchased design includes multiple 3D file formats (SKP, 3DS), compatible with popular design software.
              You can adjust colors, materials, and dimensions — or use AI tools to instantly create new variations, add people, or render artistic views.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Delivery Process</h2>
            <p>
              AI-enhanced outputs such as rotating videos, visitor renders, or sketch visuals are generated within minutes after submission.
              Design file packages (SKP, 3DS, etc.) are prepared and quality-checked before delivery, typically available within a few hours after purchase.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Commitment</h2>
            <p>
              At Exhibit3Design, our goal is to make professional exhibition design effortless.
              We combine curated design expertise with AI automation to save you time, reduce design iteration costs, and deliver stunning, exhibition-ready visuals in just a few clicks.
            </p>
          </div>
        </div>
      </div>
    </Layout>;
};
export default AboutPage;