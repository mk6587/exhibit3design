
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
      // Simulate AI content generation (in a real implementation, this would call an AI API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let generatedContent = '';
      
      switch (contentType) {
        case 'description':
          generatedContent = `
            <p>This innovative ${context.toLowerCase()} represents the perfect blend of functionality and aesthetic appeal for modern businesses.</p>
            
            <p>Key features include:</p>
            <ul>
              <li>Contemporary design that attracts and engages visitors</li>
              <li>Flexible layout accommodating various display requirements</li>
              <li>Professional presentation space for product demonstrations</li>
              <li>Integrated storage solutions for marketing materials</li>
              <li>Customizable branding areas to showcase your company identity</li>
            </ul>
          `;
          break;
          
        case 'specification':
          generatedContent = `
            <h4>Technical Specifications</h4>
            <ul>
              <li>Structure: ${context.includes('aluminum') ? 'Premium aluminum framework' : 'High-quality structural framework'}</li>
              <li>Dimensions: Customizable based on requirements (standard configurations available)</li>
              <li>Height: ${context.includes('height') ? context.match(/\d+\.?\d*m/)?.[0] || '3.5m' : '3.5m'} maximum</li>
              <li>Materials: Professional-grade materials ensuring durability and aesthetics</li>
              <li>Setup time: Efficient assembly process with clear instructions</li>
              <li>Power requirements: ${context.includes('LED') || context.includes('power') ? '220V standard connection with integrated cable management' : 'Standard electrical requirements'}</li>
            </ul>
          `;
          break;
          
        case 'basic-info':
          generatedContent = `Professional ${context.toLowerCase()} designed for maximum impact and visitor engagement at trade shows and exhibitions.`;
          break;
      }
      
      onContentGenerated(generatedContent);
      
      toast({
        title: "Content Generated",
        description: "AI has successfully generated content based on your context.",
      });
      
      setContext('');
      
    } catch (error) {
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
