import Layout from "@/components/layout/Layout";
const AboutPage = () => {
  return <Layout>
      <div className="py-12 sm:py-16 px-4">
        <div className="container mx-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About Exhibit3Design</h1>
          
          <div className="aspect-video bg-secondary mb-8 rounded-lg overflow-hidden">
            <img src="/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png" alt="Exhibition stand design" className="w-full h-full object-cover" />
          </div>
          
          <div className="prose max-w-none">
            <p className="lead text-lg mb-6">
              Exhibit3Design offers affordable exhibition stand design files created by an experienced designer 
              with years of industry expertise.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
            <p>
              As an exhibition stand design team, we've created hundreds of detailed stand designs throughout our projects. Many of these designs were never used, despite the hours of work put into them. We realized these unused designs could help other professionals in the industry who need quality solutions quickly and affordably.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Approach</h2>
            <p>
              Rather than letting these designs go to waste, I decided to offer them at an affordable price.
              This gives exhibition construction companies, other designers, and marketing teams access to 
              professional-quality designs at a fraction of the normal cost.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Who Can Benefit</h2>
            <p>
              Our design files are perfect for:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Exhibition stand builders looking for ready-to-implement designs</li>
              <li>Exhibition designers who need a starting point to save time</li>
              <li>Marketing teams planning trade show appearances on a budget</li>
              <li>Companies who need professional exhibition stands without the high design costs</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Custom Design Services</h2>
            <p>
              Need something specific that isn't in our library? I also offer custom exhibition stand design services.
              With my industry experience, I can create tailored designs that perfectly match your exhibition needs
              and brand requirements.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
            <p>Simply browse our collection of designs, purchase the one that best fits your needs, and get the files under one hour. You'll receive multiple file formats (SKP, 3DS) that you can customize to your specifications. It's that easy!</p>
          </div>
        </div>
        </div>
      </div>
    </Layout>;
};
export default AboutPage;