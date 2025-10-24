import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminBlogCleanupPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCleanup = async () => {
    setIsProcessing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('cleanup-blog-content');

      if (error) throw error;

      setResults(data);
      toast.success(`Successfully cleaned ${data.cleanedPosts} blog posts!`);
    } catch (error) {
      console.error('Error cleaning blog content:', error);
      toast.error('Failed to clean blog posts');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Blog Content Cleanup</h1>
          <p className="text-muted-foreground mt-2">
            Remove JSON artifacts from existing blog post content
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Clean All Posts</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This will scan all blog posts and remove any JSON artifacts, markdown code blocks,
                and malformed content from the posts.
              </p>
              <Button 
                onClick={handleCleanup} 
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing ? 'Cleaning Posts...' : 'Clean All Posts'}
              </Button>
            </div>

            {results && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Total Posts</div>
                    <div className="text-2xl font-bold">{results.totalPosts}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Cleaned Posts</div>
                    <div className="text-2xl font-bold text-green-600">{results.cleanedPosts}</div>
                  </Card>
                </div>

                {results.results && results.results.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Cleanup Details:</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {results.results.map((result: any, index: number) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-start gap-2">
                            {result.success ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{result.title}</div>
                              {result.success && (
                                <div className="text-sm text-muted-foreground">
                                  Content cleaned: {result.originalLength} → {result.cleanedLength} characters
                                </div>
                              )}
                              {!result.success && (
                                <div className="text-sm text-red-600">{result.error}</div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
