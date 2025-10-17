import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead = ({ 
  title = "Exhibit3Design - AI-Powered Exhibition Stand Design Platform",
  description = "Transform exhibition stands instantly with AI. Upload your sketch and get photorealistic renders, 360° walkthroughs, style variations, and presentation-ready visuals in seconds. No design experience needed.",
  keywords = "AI exhibition design, AI stand design, 360 walkthrough generator, photorealistic rendering AI, exhibition AI tools, sketch to render AI, trade show AI design, instant exhibition renders, AI-powered booth design, exhibition design automation",
  image = "https://exhibit3design.com/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png",
  url = "https://exhibit3design.com/",
  type = "website"
}: SEOHeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Exhibit3Design" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEOHead;