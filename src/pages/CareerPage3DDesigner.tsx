import Layout from '@/components/layout/Layout';
import SEOHead from '@/components/SEO/SEOHead';
import { ApplicationForm } from '@/components/career/ApplicationForm';
import { CheckCircle2, Sparkles, Globe, Users, Calendar, Euro, Heart, Linkedin, Instagram } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">We're Hiring: 3D Designer</h1>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="secondary" className="text-base py-1">
              <Globe className="h-4 w-4 mr-2" />
              Remote
            </Badge>
            <Badge variant="secondary" className="text-base py-1">
              <Euro className="h-4 w-4 mr-2" />
              €3,200 – €4,800/month
            </Badge>
            <Badge variant="secondary" className="text-base py-1">
              <Calendar className="h-4 w-4 mr-2" />
              Flexible Hours
            </Badge>
          </div>
          <p className="text-2xl font-semibold text-primary mb-2">
            "Design Beyond Borders" — that's our motto.
          </p>
          <p className="text-lg text-muted-foreground">
            If you love 3D design, modeling, and exploring creativity with AI tools, this is your place! ✨
          </p>
        </div>

        {/* About Company */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-lg mb-2">
                  We're a <strong>Spain-based international design company</strong> with over <strong>100 creatives</strong> collaborating remotely worldwide.
                </p>
                <p className="text-muted-foreground">
                  We design exhibition booths and 3D spaces using a blend of traditional and AI-assisted workflows — and we're looking for talented 3D Designers to join our growing team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Do */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            What You'll Do
          </h2>
          <ul className="space-y-3">
            {[
              'Design creative 3D spaces and exhibition booths for global brands',
              'Collaborate remotely with our international team of designers and project managers',
              'Use AI tools alongside 3D software to enhance workflows and explore new ideas',
              'Join weekly team meetings to share progress and inspiration',
              'Learn from real projects with direct guidance from senior designers'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What We're Looking For */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What We're Looking For</h2>
          <ul className="space-y-3">
            {[
              'A computer that can smoothly run 3D software',
              'Basic understanding of architecture or interior design',
              'Experience with at least one 3D tool (3ds Max, SketchUp, Blender, Cinema4D, etc.)',
              'Responsible, motivated, organized, and eager to grow'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Alert className="mt-4 border-primary/30 bg-primary/5">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>You don't need to be an expert</strong> — if you know one 3D software, we'll teach you design and AI-powered workflows.
            </AlertDescription>
          </Alert>
        </section>

        {/* Work & Schedule */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Work & Schedule
          </h2>
          <ul className="space-y-3">
            {[
              'Fully remote, flexible hours',
              'Just meet project deadlines',
              'Weekends off (Saturday & Sunday)'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Salary & Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Euro className="h-6 w-6 text-primary" />
            Salary & Benefits
          </h2>
          <ul className="space-y-3">
            {[
              '€3,200 – €4,800/month (depending on experience)',
              'Continuous learning and support from senior designers',
              'Exciting, diverse international projects',
              'Friendly, creative, and inspiring work environment'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Why You'll Love It */}
        <Card className="mb-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Why You'll Love It
            </h2>
            <p className="text-lg mb-3">
              At Exhibit3Design, creativity has no borders.
            </p>
            <p className="text-muted-foreground mb-3">
              Your ideas will be heard, your skills will grow, and your work will inspire global brands.
            </p>
            <p className="text-lg font-semibold text-primary">
              Here, design isn't just a job — it's a journey of creativity and growth.
            </p>
          </CardContent>
        </Card>

        {/* How to Apply */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How to Apply</h2>
          
          <div className="space-y-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Follow our LinkedIn page</p>
                    <a 
                      href="https://www.linkedin.com/company/exhibit3design" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <Linkedin className="h-4 w-4" />
                      linkedin.com/company/exhibit3design
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Apply and upload your CV (and portfolio if available)</p>
                    <p className="text-sm text-muted-foreground">Fill out the form below with your details</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Complete a short design task</p>
                    <p className="text-sm text-muted-foreground">After submission, we'll send you a short design task to assess your creativity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 p-4 bg-secondary/50 rounded-lg border">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Follow us on Instagram: 
              <a 
                href="https://www.instagram.com/exhibit3design" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                @exhibit3design
              </a>
            </p>
          </div>

          <ApplicationForm jobSlug="3d-designer" />
        </section>

        {/* Footer Message */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-2xl font-bold text-primary mb-2">
            Design Beyond Borders
          </p>
          <p className="text-muted-foreground">
            Where your creativity shapes the world 🎯
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CareerPage3DDesigner;
