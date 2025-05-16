
import Layout from "@/components/layout/Layout";

const AboutPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About ExhibitDesigns</h1>
          
          <div className="aspect-video bg-secondary mb-8 rounded-lg overflow-hidden">
            <img 
              src="/placeholder.svg" 
              alt="ExhibitDesigns team" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="prose max-w-none">
            <p className="lead text-lg mb-6">
              ExhibitDesigns is a premium marketplace for high-quality exhibition stand design files, 
              created by industry professionals for professionals.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p>
              Our mission is to provide exhibition designers, event companies, and marketing teams with 
              access to professionally created exhibition stand designs that can be customized and 
              implemented quickly, saving valuable time and resources.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Team</h2>
            <p>
              Founded in 2018 by a group of exhibition design professionals with over 30 years of combined 
              industry experience, ExhibitDesigns brings together expertise in architecture, 3D modeling, 
              exhibition planning, and digital commerce.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Quality Assurance</h2>
            <p>
              Every design file on our platform undergoes rigorous quality checks to ensure:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Accurate modeling and realistic rendering</li>
              <li>Optimized file sizes without compromising detail</li>
              <li>Compatibility with major 3D software platforms</li>
              <li>Structural viability and practical implementation</li>
              <li>Comprehensive documentation</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
            <p>
              At ExhibitDesigns, we believe in:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Quality:</strong> Providing the highest standard of design files</li>
              <li><strong>Innovation:</strong> Constantly pushing the boundaries of exhibition design</li>
              <li><strong>Accessibility:</strong> Making professional designs available to businesses of all sizes</li>
              <li><strong>Support:</strong> Offering excellent customer service and technical assistance</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Join Our Community</h2>
            <p>
              Whether you're an exhibition industry professional or a business looking to make an impact at your 
              next trade show, we invite you to join our growing community. Browse our collection of designs, 
              connect with us on social media, or reach out directly with any questions.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
