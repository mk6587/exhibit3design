
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIContentGeneratorProps {
  onContentGenerated: (content: string) => void;
  contentType: 'description' | 'specification' | 'basic-info';
  currentContent?: string;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  onContentGenerated,
  contentType,
  currentContent = ''
}) => {
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const getPlaceholderText = () => {
    switch (contentType) {
      case 'description':
        return 'Enter product context (e.g., "Modern exhibition stand for tech companies, 6x6m, includes LED lighting...")';
      case 'specification':
        return 'Enter technical context (e.g., "Aluminum frame, 3.5m height, LED panels, power requirements...")';
      case 'basic-info':
        return 'Enter basic product context (e.g., "Premium exhibition booth, modern design, for trade shows...")';
      default:
        return 'Enter context for AI generation...';
    }
  };

  const generateContent = async () => {
    if (!context.trim()) {
      toast({
        title: "Context Required",
        description: "Please provide context for AI content generation.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcGViZGt2emRybGp3d3hjY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjczMTAsImV4cCI6MjA2NzMwMzMxMH0.N_48R70OWvLsf5INnGiswao__kjUW6ybYdnPIRm0owk`
        },
        body: JSON.stringify({
          context: context.trim(),
          contentType,
          currentContent
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { generatedContent } = await response.json();
      
      if (generatedContent) {
        onContentGenerated(generatedContent);
        
        toast({
          title: "Content Generated",
          description: "Claude Sonnet has successfully generated content based on your context.",
        });
        
        setContext('');
      } else {
        throw new Error('No content generated');
      }
      
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ai-context">Context for AI Generation</Label>
          <Textarea
            id="ai-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={getPlaceholderText()}
            rows={3}
            className="mt-1"
          />
          <p className="text-sm text-gray-600 mt-1">
            Provide specific details about your product to generate relevant content.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={generateContent}
            disabled={isGenerating || !context.trim()}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Content'}
          </Button>
          
          {currentContent && (
            <Button 
              variant="outline" 
              onClick={() => setContext(currentContent.replace(/<[^>]*>/g, '').substring(0, 200))}
            >
              Use Current Content as Context
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIContentGenerator;
