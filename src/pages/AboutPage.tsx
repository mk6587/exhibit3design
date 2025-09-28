import Layout from "@/components/layout/Layout";
const AboutPage = () => {
  return <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About Exhibit3Design</h1>
          
          <div className="aspect-video bg-secondary mb-8 rounded-lg overflow-hidden">
            <img src="/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png" alt="Exhibition stand design" className="w-full h-full object-cover" />
          </div>
          
          <div className="prose max-w-none">
            <p className="lead text-lg mb-6">
              Exhibit3Design delivers premium exhibition stand designs from a seasoned professional with over 15 years 
              of industry expertise, serving Fortune 500 companies and leading trade show exhibitors worldwide.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Expertise</h2>
            <p>
              With over 15 years in the exhibition industry, our design team has successfully delivered over 500 exhibition projects, helping clients increase their trade show ROI by an average of 40%. We've worked with industry leaders across automotive, technology, healthcare, and manufacturing sectors, consistently meeting tight deadlines and exceeding client expectations.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Strategic Design Library</h2>
            <p>
              Our extensive design library represents years of research, innovation, and proven success in the exhibition industry. 
              Each design has been strategically developed using industry best practices, optimal traffic flow principles, and 
              conversion-focused layouts that have delivered measurable results for our clients.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Proven Value for Professionals</h2>
            <p>
              Our comprehensive design solutions are trusted by:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Exhibition contractors</strong> who need battle-tested designs that guarantee project success</li>
              <li><strong>Design professionals</strong> looking to accelerate project timelines while maintaining quality standards</li>
              <li><strong>Corporate marketing teams</strong> who require cost-effective solutions without compromising on professional impact</li>
              <li><strong>Trade show managers</strong> seeking designs with proven conversion rates and visitor engagement metrics</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Our Design Library</h2>
            <p>
              Every design in our collection has been developed using data-driven insights from real exhibition environments. 
              Our designs incorporate optimal visitor flow patterns, strategic product placement zones, and engagement-focused 
              layouts that have consistently delivered measurable results for our clients. With our proven track record of 
              on-time delivery and 98% client satisfaction rate, you're investing in designs that work.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Custom Design Services</h2>
            <p>
              Beyond our design library, we offer bespoke exhibition design services for clients requiring unique solutions. 
              Our custom projects have helped clients achieve up to 60% increases in lead generation and have won multiple 
              industry awards for innovation and effectiveness. We guarantee delivery within agreed timelines and provide 
              ongoing support throughout your exhibition journey.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Professional Service Guarantee</h2>
            <p>Access our professionally crafted designs instantly. Each purchase includes comprehensive file packages (SKP, 3DS formats), detailed specifications, and our signature rapid delivery service. With over 15 years of industry expertise backing every design, you're choosing solutions that deliver results.</p>
          </div>
        </div>
      </div>
    </Layout>;
};
export default AboutPage;