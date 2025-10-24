import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Image, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminGenerateBlogImagesPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const generateImages = async () => {
    setLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-images');

      if (error) throw error;

      setResults(data);
      
      const successCount = data.results?.filter((r: any) => r.status === 'success').length || 0;
      const errorCount = data.results?.filter((r: any) => r.status === 'error').length || 0;

      if (successCount > 0) {
        toast.success(`Successfully generated ${successCount} images`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to generate ${errorCount} images`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Generate Blog Images</h1>
          <p className="text-muted-foreground">
            Generate AI cover images for blog posts that don't have them
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              AI Image Generation
            </CardTitle>
            <CardDescription>
              This will generate professional cover images for all published blog posts that are missing featured images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                This process uses AI to generate high-quality cover images based on each blog post's title and description.
                The images will be automatically uploaded and assigned to the posts.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={generateImages} 
              disabled={loading}
              size="lg"
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Images...
                </>
              ) : (
                <>
                  <Image className="h-4 w-4 mr-2" />
                  Generate Missing Images
                </>
              )}
            </Button>

            {results && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Results</h3>
                <p className="text-sm text-muted-foreground">
                  Processed {results.total} posts
                </p>
                
                {results.results && results.results.length > 0 && (
                  <div className="space-y-2">
                    {results.results.map((result: any, index: number) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.status === 'success' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{result.title}</p>
                            {result.status === 'success' && result.imageUrl && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Image generated successfully
                              </p>
                            )}
                            {result.status === 'error' && (
                              <p className="text-sm text-red-600 mt-1">
                                Error: {result.error}
                              </p>
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            result.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
