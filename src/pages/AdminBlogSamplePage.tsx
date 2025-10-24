import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles, Image as ImageIcon, FileText, Link2, Target, Save, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  title: string;
  slug: string;
  metaDescription: string;
  content: string;
  excerpt: string;
  keywords: string[];
  internalLinks: Array<{ text: string; url: string; placement: string }>;
  ctas: Array<{ text: string; url: string; placement: string }>;
  wordCount: number;
  readabilityScore: number;
  featuredImageUrl: string | null;
}

export default function AdminBlogSamplePage() {
  const [keyword, setKeyword] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    
    setCategories(data || []);
  };

  const generatePost = async () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword or topic");
      return;
    }

    setIsGenerating(true);
    setGeneratedPost(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: { 
          keyword: keyword.trim(),
          categoryIds: selectedCategories,
          customInstructions: customInstructions.trim() || undefined
        }
      });

      if (error) throw error;

      if (data?.post) {
        setGeneratedPost(data.post);
        toast.success("Blog post generated successfully!");
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate blog post");
    } finally {
      setIsGenerating(false);
    }
  };

  const savePost = async () => {
    if (!generatedPost) return;

    setIsSaving(true);

    try {
      // The post is already saved in the database by the edge function
      // This button just confirms and shows success
      toast.success("Blog post is ready to publish! Go to Blog Posts to manage it.");
      
      // Reset form
      setKeyword("");
      setCustomInstructions("");
      setSelectedCategories([]);
      setGeneratedPost(null);
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to confirm post save");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Blog Content Generator</h1>
          <p className="text-muted-foreground">
            Generate complete, SEO-optimized blog posts with AI-generated content and featured images
          </p>
        </div>

        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            Each generated post is automatically saved as a draft. You can publish it from the Blog Posts page.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Generate New Blog Post</CardTitle>
            <CardDescription>
              Enter a topic and optional instructions to create a full blog article with AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">Topic / Keyword *</Label>
              <Input
                id="keyword"
                placeholder="e.g., Top 10 Exhibition Stand Design Trends for 2025"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                placeholder="e.g., Focus on sustainability, include case studies, target event organizers..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                disabled={isGenerating}
                rows={3}
              />
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <Label>Categories (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                        disabled={isGenerating}
                      />
                      <label
                        htmlFor={`cat-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={generatePost}
              disabled={isGenerating || !keyword.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating... (30-60 seconds)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Blog Post
                </>
              )}
            </Button>
            
            {isGenerating && (
              <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted rounded-lg">
                <p className="font-medium">⏳ Please wait while AI creates your content...</p>
                <p>📝 Writing 1500+ word article</p>
                <p>🎨 Generating featured image</p>
                <p>🔗 Adding CTAs and internal links</p>
                <p>✅ Optimizing for SEO</p>
              </div>
            )}
          </CardContent>
        </Card>

        {generatedPost && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={savePost}
                disabled={isSaving}
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Confirm & Continue
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('/admin/blog-posts', '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                View All Posts
              </Button>
            </div>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Content Metrics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">{generatedPost.wordCount}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{generatedPost.internalLinks.length}</div>
                  <div className="text-sm text-muted-foreground">Internal Links</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{generatedPost.ctas.length}</div>
                  <div className="text-sm text-muted-foreground">CTAs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{generatedPost.readabilityScore}</div>
                  <div className="text-sm text-muted-foreground">Readability</div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            {generatedPost.featuredImageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    AI-Generated Featured Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={generatedPost.featuredImageUrl} 
                    alt={generatedPost.title}
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                </CardContent>
              </Card>
            )}

            {/* Article Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Article Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{generatedPost.title}</h2>
                  <p className="text-muted-foreground italic mb-4">{generatedPost.metaDescription}</p>
                  {generatedPost.excerpt && (
                    <p className="text-sm text-muted-foreground">{generatedPost.excerpt}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {generatedPost.keywords.map((kw, i) => (
                    <Badge key={i} variant="outline">{kw}</Badge>
                  ))}
                </div>

                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: generatedPost.content }}
                />
              </CardContent>
            </Card>

            {/* CTAs */}
            {generatedPost.ctas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Call-to-Actions ({generatedPost.ctas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedPost.ctas.map((cta, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Badge variant="secondary">{i + 1}</Badge>
                        <span className="font-medium">{cta.text}</span>
                        <span className="text-muted-foreground">→</span>
                        <code className="text-sm">{cta.url}</code>
                        <span className="text-xs text-muted-foreground ml-auto">{cta.placement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Internal Links */}
            {generatedPost.internalLinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Internal Links ({generatedPost.internalLinks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedPost.internalLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Badge variant="outline">{i + 1}</Badge>
                        <span>{link.text}</span>
                        <span className="text-muted-foreground">→</span>
                        <code className="text-sm">{link.url}</code>
                        <span className="text-xs text-muted-foreground ml-auto">{link.placement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}