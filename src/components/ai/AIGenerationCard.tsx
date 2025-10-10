import { useState } from "react";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface AIGenerationCardProps {
  generation: {
    id: string;
    prompt: string;
    service_type: string;
    input_image_url: string | null;
    output_image_url: string;
    tokens_used: number;
    created_at: string;
  };
  formatDate: (date: string) => string;
  formatServiceType: (type: string) => string;
}

export function AIGenerationCard({ generation, formatDate, formatServiceType }: AIGenerationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasSourceImage = !!generation.input_image_url;
  
  // Show source on hover if it exists, otherwise always show result
  const displayImage = (isHovered && hasSourceImage) 
    ? generation.input_image_url 
    : generation.output_image_url;
  
  const isVideo = generation.output_image_url.endsWith('.mp4');

  // Determine service link based on service type
  const getServiceLink = () => {
    const serviceMap: Record<string, string> = {
      'animation': '/pricing',
      'image_generation': '/pricing',
      'image_edit': '/pricing',
      'style_transfer': '/pricing',
      'video_generation': '/pricing',
      'ai_edit': '/pricing'
    };
    return serviceMap[generation.service_type] || '/pricing';
  };

  return (
    <Link
      to={getServiceLink()}
      className="group relative bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image with hover effect */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {isVideo && !isHovered ? (
          <video
            src={generation.output_image_url}
            className="w-full h-full object-cover transition-all duration-300"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img
            src={displayImage}
            alt={isHovered && hasSourceImage ? "Source image" : "AI Generated Result"}
            className="w-full h-full object-cover transition-all duration-300"
            loading="lazy"
          />
        )}
        <Badge 
          variant="secondary" 
          className="absolute top-3 right-3 z-10 bg-background/95 backdrop-blur-sm shadow-lg"
        >
          {generation.tokens_used} {generation.tokens_used === 1 ? 'token' : 'tokens'}
        </Badge>
        {hasSourceImage && (
          <Badge 
            variant={isHovered ? "default" : "outline"}
            className="absolute top-3 left-3 z-10 bg-background/95 backdrop-blur-sm shadow-lg transition-all duration-300"
          >
            {isHovered ? "Source" : "Result"}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(generation.created_at)}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {formatServiceType(generation.service_type)}
          </Badge>
        </div>
      </div>
    </Link>
  );
}