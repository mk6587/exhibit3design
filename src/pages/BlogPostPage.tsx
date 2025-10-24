import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEO/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Eye, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  keywords: string[];
  featured_image_url: string | null;
  published_at: string;
  view_count: number;
  readability_score: number;
  word_count: number;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string | null;
  published_at: string;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setPost(data as BlogPost);

      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      // Fetch related posts
      const { data: related } = await supabase
        .from('blog_posts')
        .select('id, title, slug, featured_image_url, published_at')
        .eq('status', 'published')
        .neq('id', data.id)
        .limit(3)
        .order('published_at', { ascending: false });

      if (related) {
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const readingTime = Math.ceil((post?.word_count || 0) / 200);

  const shareUrl = `${window.location.origin}/academy/${slug}`;
  
  const handleShare = (platform: string) => {
    const title = post?.title || '';
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-muted animate-pulse rounded mb-4" />
            <div className="h-96 bg-muted animate-pulse rounded mb-8" />
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/academy">Browse All Posts</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${post.title} | Exhibit3Design Academy`}
        description={post.meta_description}
        url={`https://exhibit3design.com/academy/${post.slug}`}
        image={post.featured_image_url || undefined}
        keywords={post.keywords.join(', ')}
        type="article"
      />
      
      {/* Article Schema Markup */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.meta_description,
            "image": post.featured_image_url || "https://exhibit3design.com/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png",
            "datePublished": post.published_at,
            "dateModified": post.published_at,
            "author": {
              "@type": "Organization",
              "name": "Exhibit3Design"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Exhibit3Design",
              "logo": {
                "@type": "ImageObject",
                "url": "https://exhibit3design.com/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://exhibit3design.com/academy/${post.slug}`
            },
            "keywords": post.keywords.join(', '),
            "wordCount": post.word_count,
            "articleBody": post.content.replace(/<[^>]*>/g, '')
          })}
        </script>
      </Helmet>

      <article className="py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="max-w-4xl mx-auto mb-8">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Academy", href: "/academy" },
                { label: post.title }
              ]}
            />
          </div>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="max-w-4xl mx-auto mb-8">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="max-w-4xl mx-auto mb-8">
            <h1 className="text-2xl font-bold mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {readingTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.view_count} views
              </span>
            </div>

            {post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.keywords.map((keyword, i) => (
                  <Badge key={i} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Share:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('copy')}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Article Content */}
          <div className="max-w-4xl mx-auto">
            <div 
              className="prose prose-lg max-w-none [&>p]:mb-4 [&>h1]:mb-4 [&>h1]:font-bold [&>h2]:mb-4 [&>h2]:font-bold [&>h3]:mb-4 [&>h3]:font-bold [&>h4]:mb-4 [&>h4]:font-bold [&>ul]:mb-4 [&>ol]:mb-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          <Separator className="my-12 max-w-4xl mx-auto" />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/academy/${relatedPost.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                      {relatedPost.featured_image_url && (
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={relatedPost.featured_image_url}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {format(new Date(relatedPost.published_at), 'MMM d, yyyy')}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="max-w-4xl mx-auto mt-12">
            <Card className="bg-gradient-to-br from-primary/10 to-background">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Create Stunning Exhibition Stands?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try our AI-powered design tools and transform your exhibition concepts into reality
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild className="underline decoration-2 underline-offset-4">
                    <Link to="/ai-samples">Try AI Studio</Link>
                  </Button>
                  <Button variant="outline" asChild className="underline decoration-2 underline-offset-4">
                    <Link to="/products">Browse Designs</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </article>
    </Layout>
  );
}
