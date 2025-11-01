import Layout from '@/components/layout/Layout';
import SEOHead from '@/components/SEO/SEOHead';
import { ApplicationForm } from '@/components/career/ApplicationForm';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CareerPage3DDesigner = () => {
  return (
    <Layout>
      <SEOHead
        title="3D Designer - Career Opportunity | Exhibit3Design"
        description="Join our team as a 3D Designer and work on cutting-edge exhibition stand designs powered by AI technology. Apply now to shape the future of exhibition design."
        keywords="3d designer job, exhibition design career, ai design job, 3d modeling job"
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">3D Designer</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span>📍 Remote</span>
            <span>⏰ Full-time</span>
            <span>💼 Design</span>
          </div>
        </div>

        {/* Role Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">About the Role</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-lg mb-4">
              We're looking for a talented 3D Designer to join our team and help shape the future of exhibition stand design. 
              You'll work with cutting-edge AI tools to create stunning, professional-grade 3D models and visualizations.
            </p>
            <p className="text-muted-foreground">
              As a 3D Designer at Exhibit3Design, you'll be at the intersection of creativity and technology, 
              working with our AI-powered platform to deliver exceptional design solutions for clients worldwide.
            </p>
          </div>
        </section>

        {/* Requirements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What We're Looking For</h2>
          <ul className="space-y-3">
            {[
              'Strong portfolio demonstrating 3D modeling and visualization skills',
              'Proficiency in 3D software (SketchUp, 3ds Max, or similar)',
              'Understanding of exhibition design principles and spatial concepts',
              'Experience with rendering engines and material creation',
              'Ability to work independently and meet deadlines',
              'Excellent communication skills and attention to detail',
              'Enthusiasm for AI-assisted design tools and workflows',
            ].map((requirement, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What We Offer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
          <ul className="space-y-3">
            {[
              'Competitive salary and benefits package',
              'Flexible remote work environment',
              'Access to cutting-edge AI design tools',
              'Opportunity to work on diverse, international projects',
              'Professional development and learning opportunities',
              'Collaborative and innovative team culture',
            ].map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Why Tokens Box */}
        <Alert className="mb-12 border-primary bg-primary/5">
          <AlertDescription>
            <h3 className="font-semibold text-lg mb-2">Why do we ask you to use 1 token first?</h3>
            <p className="text-muted-foreground">
              We hire people who understand our AI for 3D design. A single generation helps you experience 
              what you'll be building and supporting. It ensures you're genuinely interested in working with 
              AI-powered design tools and understand the value we provide to our customers.
            </p>
          </AlertDescription>
        </Alert>

        {/* Application Form */}
        <ApplicationForm jobSlug="3d-designer" />

        {/* Next Steps */}
        <section className="mt-12 bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3">What Happens Next?</h3>
          <ol className="space-y-2 text-muted-foreground">
            <li>1. We review your application and portfolio (typically within 5 business days)</li>
            <li>2. Selected candidates will be invited for an initial video interview</li>
            <li>3. Technical assessment and portfolio review session</li>
            <li>4. Final interview with the design team</li>
            <li>5. Offer and onboarding</li>
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">
            We value diversity and are committed to creating an inclusive environment for all employees.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default CareerPage3DDesigner;
