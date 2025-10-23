import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEO/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Calendar, Eye, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  featured_image_url: string | null;
  published_at: string;
  view_count: number;
  readability_score: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const postsPerPage = 12;

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, title, slug, meta_description, featured_image_url, published_at, view_count, readability_score')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (selectedCategory) {
        const { data: categoryPosts } = await supabase
          .from('blog_post_categories')
          .select('post_id')
          .eq('category_id', selectedCategory);

        if (categoryPosts) {
          const postIds = categoryPosts.map(cp => cp.post_id);
          query = query.in('id', postIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts((data as BlogPost[]) || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('blog_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('display_order');

    if (data) {
      setCategories(data);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.meta_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedPosts = filteredPosts.slice((page - 1) * postsPerPage, page * postsPerPage);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <Layout>
      <SEOHead
        title="Exhibition Design Blog & Academy | Exhibit3Design"
        description="Learn exhibition stand design, AI tools, and trade show strategies. Expert guides, tutorials, and insights for creating stunning booths."
        url="https://exhibit3design.com/blog"
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Exhibition Design Academy
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Master exhibition stand design with AI-powered tools, expert insights, and proven strategies
            </p>
            
            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
            >
              All Posts
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-6 space-y-3">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-20 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : paginatedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchQuery ? 'No posts found matching your search.' : 'No posts available yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                      {post.featured_image_url && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(post.published_at), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.view_count}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-3">
                          {post.meta_description}
                        </p>
                        <div className="flex items-center text-primary font-medium">
                          Read More
                          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? 'default' : 'outline'}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Exhibition Designs?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Try our AI-powered design tools and create stunning exhibition stands in minutes
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/ai-samples">Explore AI Tools</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/products">Browse Designs</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
