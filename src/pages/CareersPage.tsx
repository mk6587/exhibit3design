import Layout from '@/components/layout/Layout';
import SEOHead from '@/components/SEO/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, Clock, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const CareersPage = () => {
  const openPositions = [
    {
      id: '3d-designer',
      title: '3D Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Join our team as a 3D Designer and work on cutting-edge exhibition stand designs powered by AI technology.',
      link: '/careers/3d-designer'
    }
  ];

  return (
    <Layout>
      <SEOHead
        title="Careers - Join Our Team | Exhibit3Design"
        description="Explore career opportunities at Exhibit3Design. Join our team and help shape the future of exhibition design with AI-powered tools and innovation."
        keywords="careers, jobs, exhibition design jobs, 3d designer jobs, ai design careers"
      />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Be part of a team that's revolutionizing exhibition design with cutting-edge AI technology. 
            We're building the future of design collaboration and creativity.
          </p>
        </div>

        {/* Why Join Us Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Exhibit3Design?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🚀 Innovation First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Work with cutting-edge AI tools and be at the forefront of design technology innovation.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>🌍 Remote Freedom</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Work from anywhere in the world. We believe in flexibility and work-life balance.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>📈 Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Continuous learning, skill development, and career advancement in a fast-growing company.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Open Positions */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Open Positions</h2>
          
          {openPositions.length > 0 ? (
            <div className="space-y-6">
              {openPositions.map((position) => (
                <Card key={position.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl mb-2">{position.title}</CardTitle>
                        <CardDescription className="text-base">
                          {position.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="w-fit">
                        {position.department}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 mb-6 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{position.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{position.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{position.department}</span>
                      </div>
                    </div>
                    
                    <Link to={position.link}>
                      <Button className="w-full md:w-auto">
                        View Position & Apply
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  We don't have any open positions at the moment, but we're always looking for talented people.
                </p>
                <p className="text-sm text-muted-foreground">
                  Feel free to reach out to us at <a href="mailto:careers@exhibit3design.com" className="text-primary hover:underline">careers@exhibit3design.com</a> 
                  {' '}to introduce yourself and share your portfolio.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Call to Action */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">Don't See a Perfect Fit?</h3>
              <p className="text-muted-foreground mb-6">
                We're always interested in meeting talented individuals. Send us your portfolio and tell us how you'd like to contribute to our mission.
              </p>
              <Link to="/contact">
                <Button variant="outline">
                  Get in Touch
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CareersPage;
