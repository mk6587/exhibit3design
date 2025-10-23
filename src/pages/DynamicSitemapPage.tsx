import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DynamicSitemapPage = () => {
  const [xmlContent, setXmlContent] = useState<string>("");

  useEffect(() => {
    // Set content type to XML
    const metaTag = document.querySelector('meta[http-equiv="Content-Type"]');
    if (metaTag) {
      metaTag.setAttribute("content", "application/xml; charset=UTF-8");
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("http-equiv", "Content-Type");
      meta.setAttribute("content", "application/xml; charset=UTF-8");
      document.head.appendChild(meta);
    }

    generateSitemap();
  }, []);

  const generateSitemap = async () => {
    try {
      // Fetch published blog posts
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("slug, updated_at, featured_image_url, title")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      const baseUrl = "https://www.exhibit3design.com";
      const currentDate = new Date().toISOString().split("T")[0];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png</image:loc>
      <image:title>Exhibition Stand Design AI Platform</image:title>
      <image:caption>AI-powered exhibition booth design with 360 rendering</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/academy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/ai-samples</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/faq</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>`;

      // Add blog posts to sitemap
      if (posts && posts.length > 0) {
        posts.forEach((post) => {
          const lastMod = post.updated_at
            ? new Date(post.updated_at).toISOString().split("T")[0]
            : currentDate;

          sitemap += `
  <url>
    <loc>${baseUrl}/academy/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

          if (post.featured_image_url) {
            sitemap += `
    <image:image>
      <image:loc>${post.featured_image_url}</image:loc>
      <image:title>${post.title.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case "<": return "&lt;";
          case ">": return "&gt;";
          case "&": return "&amp;";
          case "'": return "&apos;";
          case '"': return "&quot;";
          default: return c;
        }
      })}</image:title>
    </image:image>`;
          }

          sitemap += `
  </url>`;
        });
      }

      sitemap += `
</urlset>`;

      setXmlContent(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      setXmlContent("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"></urlset>");
    }
  };

  return (
    <pre
      style={{
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        padding: "20px",
        backgroundColor: "#f5f5f5",
      }}
    >
      {xmlContent}
    </pre>
  );
};

export default DynamicSitemapPage;
