import { useEffect } from 'react';

const SitemapPage = () => {
  useEffect(() => {
    // Set the proper content type for XML
    document.querySelector('meta[name="content-type"]')?.setAttribute('content', 'application/xml');
    
    // Set the document title
    document.title = 'Sitemap';
    
    // Hide the body content and show only XML
    document.body.style.fontFamily = 'monospace';
    document.body.style.whiteSpace = 'pre';
    document.body.style.margin = '0';
    document.body.style.padding = '20px';
  }, []);

  const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
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
    <pre style={{ margin: 0, padding: '20px', fontFamily: 'monospace', fontSize: '14px' }}>
      {sitemapXML}
    </pre>
  );
};

export default SitemapPage;