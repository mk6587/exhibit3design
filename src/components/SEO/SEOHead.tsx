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
      
      {/* JSON-LD Structured Data - WebSite Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Exhibit3Design",
          "url": "https://exhibit3design.com",
          "description": "AI-powered exhibition stand design platform. Transform sketches into photorealistic renders, 360° walkthroughs, and presentation-ready visuals instantly.",
          "keywords": [
            "exhibition stand design", "AI exhibition design", "3D booth design", "trade show booth ideas",
            "exhibition stand design ideas", "creative exhibition stand", "booth concept design", 
            "custom trade show stand", "modern exhibition booth", "AI-powered booth design",
            "360 booth video", "rotating stand video", "exhibition stand planning", "3D stand design",
            "photorealistic exhibition renders", "AI booth rendering", "instant exhibition design",
            "exhibition design automation", "booth layout ideas", "trade show design tools",
            "exhibition stand mockups", "AI stand visualization", "booth design templates",
            "exhibition AI tools", "sketch to render", "magic edit booth design",
            "exhibition stand renderings", "booth architecture", "event booth concepts",
            "exhibition floor plan", "stand design inspiration", "AI design platform"
          ],
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://exhibit3design.com/products?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
      
      {/* JSON-LD Structured Data - Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Exhibit3Design",
          "url": "https://exhibit3design.com",
          "logo": "https://exhibit3design.com/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png",
          "sameAs": [],
          "description": "Professional exhibition stand design platform enhanced with AI technology for instant renders, 360° videos, and booth customization."
        })}
      </script>
      
      {/* JSON-LD Structured Data - SoftwareApplication Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Exhibit3Design AI Studio",
          "applicationCategory": "DesignApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "EUR",
            "lowPrice": "0",
            "highPrice": "199"
          },
          "description": "AI-powered exhibition stand design platform. Transform sketches into photorealistic renders, 360° walkthroughs, and presentation-ready visuals instantly.",
          "featureList": [
            "AI-powered exhibition design",
            "360° rotating booth videos",
            "Photorealistic rendering",
            "Sketch to render conversion",
            "Magic edit customization",
            "Instant visitor scenes",
            "3D booth downloads",
            "Ready-made design templates"
          ],
          "url": "https://exhibit3design.com"
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;