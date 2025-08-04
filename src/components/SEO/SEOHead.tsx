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
  title = "Exhibit3Design - Premium Exhibition Stand Design Services",
  description = "Professional exhibition stand design and custom services. Modern, innovative designs for trade shows and exhibitions. Economy to premium options available.",
  keywords = "exhibition stand design, trade show booth, custom exhibition design, exhibition services, stand builder",
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