import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { trackPageView } from "@/services/ga4Analytics";

const AboutPage = () => {
  useEffect(() => {
    trackPageView('/about', 'About Us - Our Story');
  }, []);

  return <Layout
      title="About Exhibit3Design | AI Exhibition Stand Design Platform & 3D Downloads"
      description="Professional exhibition stand design platform combining ready-made 3D booth files (SKP, 3DS) with AI-powered enhancements. Instant photorealistic renders, 360° rotating videos, realistic visitor scenes, sketch conversions, and Magic Edit customization. Built for exhibition contractors, designers, and marketing teams."
      keywords="AI exhibition design platform, AI-powered trade show design, exhibition AI tools, about exhibit3design, exhibition design company, AI booth design platform, 3D exhibition downloads, professional booth design, exhibition stand AI technology, trade show design automation, booth rendering platform, exhibition AI innovation, AI design for exhibitions, exhibition stand company, booth design solutions, AI exhibition tools provider, exhibition design technology, booth customization platform"
      url="https://exhibit3design.com/about"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About Exhibit3Design</h1>
          
          <div className="aspect-video bg-secondary mb-8 rounded-lg overflow-hidden">
            <img src="/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png" alt="AI-powered exhibition stand design with 360 booth rendering and photorealistic visitors - professional trade show booth concept" className="w-full h-full object-cover" />
          </div>
          
          <div className="prose max-w-none">
            <p className="lead text-lg mb-6">
              Exhibit3Design is an AI-powered exhibition stand design platform built for the trade show industry.
              We offer a curated collection of ready-made professional 3D booth designs (available in SKP, 3DS formats) that you can instantly enhance with powerful AI tools — including 360° rotating videos, realistic visitor scenes, photorealistic rendering, artistic sketch conversions, and Magic Edit customization for layouts, colors, and materials.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">What We Offer: 3D Booth Files + AI Enhancement Tools</h2>
            <p>
              Our platform combines downloadable 3D exhibition stand designs with AI-powered transformation tools.
              Each ready-made booth design is optimized for practical trade show use, featuring balanced layouts, clean aesthetics, and functional spaces for product display, visitor interaction, and meeting areas.
              Download professional 3D files (SketchUp, 3DS Max formats), then use our AI tools to generate 360° rotating videos, add photorealistic visitors, create artistic sketches, or instantly customize colors and materials with Magic Edit — all without complex 3D software or design experience.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Why It's Different: AI Trained for Exhibition Stands</h2>
            <p>
              Unlike generic 3D model libraries or general AI image generators, Exhibit3Design uses AI specifically trained for exhibition stand design and trade show booth visualization.
              You don't need to write complex prompts or make endless tweaks. Simply select a ready-made booth design, upload it to our AI Studio, and instantly generate 360° rotating videos, add realistic event visitors, convert to artistic sketches, or customize layouts with simple text commands.
              You get accurate, presentation-ready exhibition visuals that align with trade show standards — in minutes, not days.
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
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Professional 3D File Formats & AI Customization</h2>
            <p>
              Each booth design download includes multiple professional 3D file formats: SketchUp (.skp), 3D Studio Max (.max), 3D Studio (.3ds), and technical PDF drawings.
              These files are fully compatible with industry-standard 3D software, allowing you to manually adjust dimensions, materials, and layouts in your preferred tool.
              Additionally, you can skip the technical work and use our AI tools to instantly generate 360° rotation videos, add photorealistic exhibition visitors, create pencil sketch renderings, or use Magic Edit to change booth colors, materials, and design elements with simple text prompts — perfect for quick client presentations or concept exploration.
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