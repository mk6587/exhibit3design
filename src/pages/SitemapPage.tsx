import { useEffect } from 'react';

const SitemapPage = () => {
  useEffect(() => {
    // Set content type to XML
    const metaContentType = document.querySelector('meta[http-equiv="Content-Type"]');
    if (metaContentType) {
      metaContentType.setAttribute('content', 'application/xml; charset=UTF-8');
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Type');
      meta.setAttribute('content', 'application/xml; charset=UTF-8');
      document.head.appendChild(meta);
    }
  }, []);

  // Return raw XML content
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://www.exhibit3design.com/</loc>
        <lastmod>2025-08-05</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://www.exhibit3design.com/products</loc>
        <lastmod>2025-08-05</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://www.exhibit3design.com/about</loc>
        <lastmod>2025-08-05</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://www.exhibit3design.com/contact</loc>
        <lastmod>2025-08-05</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://www.exhibit3design.com/faq</loc>
        <lastmod>2025-08-05</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://www.exhibit3design.com/privacy</loc>
        <lastmod>2025-08-05</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.5</priority>
    </url>
</urlset>`;

  return (
    <pre 
      style={{ 
        fontFamily: 'monospace', 
        margin: 0, 
        padding: '20px',
        backgroundColor: 'white',
        color: 'black',
        fontSize: '14px',
        lineHeight: '1.4',
        whiteSpace: 'pre-wrap',
        overflow: 'auto'
      }}
    >
      {xmlContent}
    </pre>
  );
};

export default SitemapPage;