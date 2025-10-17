import Layout from "@/components/layout/Layout";
const AboutPage = () => {
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
              Exhibit3Design offers a curated collection of professional exhibition stand designs, 
              available for purchase and delivery for your next trade show project.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">What We Offer</h2>
            <p>
              Our design library features modern, professional exhibition stand concepts created specifically for the trade show industry. 
              Each design comes as a complete package with multiple file formats, allowing you to adapt and customize them for your specific needs.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Professional Design Collection</h2>
            <p>
              Every design in our collection has been carefully crafted with practical exhibition requirements in mind. 
              We focus on clean aesthetics, functional layouts, and designs that work well in real exhibition environments. 
              Our designs consider visitor flow, product display areas, and meeting spaces that are essential for successful trade shows.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Who Benefits from Our Designs</h2>
            <p>
              Our design library serves various professionals in the exhibition industry:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Exhibition contractors</strong> who need ready-to-use designs for client projects</li>
              <li><strong>Design professionals</strong> looking for inspiration or starting points for custom work</li>
              <li><strong>Marketing teams</strong> who need professional designs without the high cost of custom development</li>
              <li><strong>Small businesses</strong> participating in trade shows who want professional-looking stands</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">File Formats and Usage</h2>
            <p>
              Each design purchase includes multiple file formats (SKP, 3DS) that can be opened in most 3D software applications. 
              This flexibility allows you to modify colors, materials, dimensions, and other elements to match your brand and 
              specific requirements. The designs are created to be easily customizable while maintaining their professional appearance.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Delivery Process</h2>
            <p>
              After purchase, your design files are prepared and processed for delivery. This process typically takes several hours 
              to ensure you receive complete, high-quality files. You will be notified when your design files are ready for download.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Commitment</h2>
            <p>We focus on providing practical, professional designs that save you time and effort. Each design is created with attention to detail and real-world exhibition requirements, giving you a solid foundation for your next trade show project.</p>
          </div>
        </div>
      </div>
    </Layout>;
};
export default AboutPage;