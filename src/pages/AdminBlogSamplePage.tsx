import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Image as ImageIcon, FileText, Link2, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlogSample {
  title: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  internalLinks: Array<{ text: string; url: string; placement: string }>;
  ctas: Array<{ text: string; url: string; placement: string }>;
  wordCount: number;
  readabilityScore: number;
  featuredImage: string | null;
  generatedAt: string;
  keyword: string;
  qualityScore: number;
}

export default function AdminBlogSamplePage() {
  const [keyword, setKeyword] = useState("Top 10 benefits of using AI in booth design");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sample, setSample] = useState<BlogSample | null>(null);

  const generateSample = async () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    setIsGenerating(true);
    setSample(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-sample-blog', {
        body: { keyword: keyword.trim() }
      });

      if (error) throw error;

      setSample(data);
      toast.success("Sample blog post generated successfully!");
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate sample");
    } finally {
      setIsGenerating(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Blog Content Sample Generator</h1>
          <p className="text-muted-foreground">
            Test the automated blog generation system by creating a sample article. This will show you exactly what content the AI will produce.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Sample Article</CardTitle>
            <CardDescription>
              Enter a keyword or topic to generate a complete blog post with AI-generated content and image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Exhibition Stand Design Ideas for 2025"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateSample()}
                disabled={isGenerating}
              />
              <Button 
                onClick={generateSample}
                disabled={isGenerating}
                className="whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Sample
                  </>
                )}
              </Button>
            </div>
            
            {isGenerating && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>⏳ This may take 30-60 seconds...</p>
                <p>🤖 AI is writing a 1500+ word article</p>
                <p>🎨 AI is generating a featured image</p>
                <p>🔗 AI is placing CTAs and internal links</p>
              </div>
            )}
          </CardContent>
        </Card>

        {sample && (
          <div className="space-y-6">
            {/* Quality Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Content Quality Analysis</span>
                  <Badge className={getQualityColor(sample.qualityScore)}>
                    Score: {sample.qualityScore}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">{sample.wordCount}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{sample.internalLinks.length}</div>
                  <div className="text-sm text-muted-foreground">Internal Links</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{sample.ctas.length}</div>
                  <div className="text-sm text-muted-foreground">CTAs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{sample.readabilityScore}</div>
                  <div className="text-sm text-muted-foreground">Readability</div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            {sample.featuredImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    AI-Generated Featured Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={sample.featuredImage} 
                    alt={sample.title}
                    className="w-full rounded-lg"
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
                  <h2 className="text-2xl font-bold mb-2">{sample.title}</h2>
                  <p className="text-muted-foreground italic">{sample.metaDescription}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sample.keywords.map((kw, i) => (
                    <Badge key={i} variant="outline">{kw}</Badge>
                  ))}
                </div>

                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sample.content }}
                />
              </CardContent>
            </Card>

            {/* CTAs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Call-to-Actions ({sample.ctas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sample.ctas.map((cta, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
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

            {/* Internal Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  Internal Links ({sample.internalLinks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sample.internalLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
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

            {/* Generation Metadata */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Generated:</strong> {new Date(sample.generatedAt).toLocaleString()}</p>
                  <p><strong>Keyword:</strong> {sample.keyword}</p>
                  <p><strong>Model:</strong> google/gemini-2.5-flash (text) + google/gemini-2.5-flash-image-preview (image)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
