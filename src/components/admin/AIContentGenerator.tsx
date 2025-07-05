
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Image as ImageIcon, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIContentGeneratorProps {
  onContentGenerated: (content: string) => void;
  contentType: 'description' | 'specification' | 'basic-info';
  currentContent?: string;
  productImages?: string[];
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  onContentGenerated,
  contentType,
  currentContent = '',
  productImages = []
}) => {
  const [context, setContext] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [useImageAnalysis, setUseImageAnalysis] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const getPlaceholderText = () => {
    switch (contentType) {
      case 'description':
        return useImageAnalysis 
          ? 'Enter additional context about the product (optional - AI will analyze the selected image)'
          : 'Enter product context (e.g., "Modern exhibition stand for tech companies, 6x6m, includes LED lighting...")';
      case 'specification':
        return useImageAnalysis
          ? 'Enter technical details to complement image analysis (optional)'
          : 'Enter technical context (e.g., "Aluminum frame, 3.5m height, LED panels, power requirements...")';
      case 'basic-info':
        return useImageAnalysis
          ? 'Enter basic context to complement image analysis (optional)'
          : 'Enter basic product context (e.g., "Premium exhibition booth, modern design, for trade shows...")';
      default:
        return 'Enter context for AI generation...';
    }
  };

  const analyzeImage = async (imageUrl: string) => {
    // Simulate image analysis (in a real implementation, this would call a vision AI API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock image analysis results based on common exhibition/trade show imagery
    const mockAnalysis = {
      description: [
        "This modern exhibition stand features a sleek, professional design with clean lines and contemporary aesthetics.",
        "The structure includes integrated display panels, professional lighting systems, and strategic branding areas.",
        "The booth design emphasizes visitor engagement with open spaces for demonstrations and consultations.",
        "Premium materials and finishes create an upscale appearance that reflects brand quality and professionalism."
      ],
      specifications: [
        "Modular aluminum framework construction for durability and easy assembly",
        "Integrated LED lighting system with adjustable brightness controls",
        "High-quality fabric graphics with vibrant color reproduction",
        "Built-in storage compartments for marketing materials and personal items",
        "Cable management system for clean electrical connections",
        "Carpet flooring with sound-dampening properties"
      ],
      basicInfo: [
        "Professional exhibition stand designed for maximum visual impact and visitor engagement",
        "Suitable for trade shows, conferences, and commercial exhibitions",
        "Modern design aesthetic that complements various brand identities"
      ]
    };

    return mockAnalysis;
  };

  const generateContent = async () => {
    if (!useImageAnalysis && !context.trim()) {
      toast({
        title: "Context Required",
        description: "Please provide context for AI content generation or select an image to analyze.",
        variant: "destructive"
      });
      return;
    }

    if (useImageAnalysis && !selectedImage) {
      toast({
        title: "Image Selection Required",
        description: "Please select an image to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let generatedContent = '';
      
      if (useImageAnalysis && selectedImage) {
        // Analyze the selected image
        const imageAnalysis = await analyzeImage(selectedImage);
        
        switch (contentType) {
          case 'description':
            generatedContent = `
              <p>${imageAnalysis.description[0]}</p>
              
              <p>Key visual features observed:</p>
              <ul>
                ${imageAnalysis.description.slice(1).map(desc => `<li>${desc}</li>`).join('')}
              </ul>
              
              ${context.trim() ? `<p>Additional context: ${context}</p>` : ''}
            `;
            break;
            
          case 'specification':
            generatedContent = `
              <h4>Technical Specifications (Based on Image Analysis)</h4>
              <ul>
                ${imageAnalysis.specifications.map(spec => `<li>${spec}</li>`).join('')}
              </ul>
              
              ${context.trim() ? `<h4>Additional Technical Details</h4><p>${context}</p>` : ''}
            `;
            break;
            
          case 'basic-info':
            generatedContent = `${imageAnalysis.basicInfo[0]}${context.trim() ? `. ${context}` : ''}`;
            break;
        }
      } else {
        // Generate content based on text context only (existing functionality)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
      }
      
      onContentGenerated(generatedContent);
      
      toast({
        title: "Content Generated",
        description: useImageAnalysis 
          ? "AI has analyzed the selected image and generated content."
          : "AI has successfully generated content based on your context.",
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
        {productImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-image-analysis"
                checked={useImageAnalysis}
                onChange={(e) => setUseImageAnalysis(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="use-image-analysis" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Analyze product images to generate content
              </Label>
            </div>
            
            {useImageAnalysis && (
              <div>
                <Label htmlFor="image-select">Select Image to Analyze</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={selectedImage} onValueChange={setSelectedImage}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose an image..." />
                    </SelectTrigger>
                    <SelectContent>
                      {productImages.map((image, index) => (
                        <SelectItem key={index} value={image}>
                          Image {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedImage, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {selectedImage && (
                  <div className="mt-2">
                    <img 
                      src={selectedImage} 
                      alt="Selected for analysis"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div>
          <Label htmlFor="ai-context">
            {useImageAnalysis ? 'Additional Context (Optional)' : 'Context for AI Generation'}
          </Label>
          <Textarea
            id="ai-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={getPlaceholderText()}
            rows={3}
            className="mt-1"
          />
          <p className="text-sm text-gray-600 mt-1">
            {useImageAnalysis 
              ? 'AI will analyze the selected image. Add any additional context here.'
              : 'Provide specific details about your product to generate relevant content.'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={generateContent}
            disabled={isGenerating || (!useImageAnalysis && !context.trim()) || (useImageAnalysis && !selectedImage)}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : useImageAnalysis ? 'Analyze & Generate' : 'Generate Content'}
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
