import { useState } from "react";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div
      className="group relative bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all"
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
        <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm">
          {generation.tokens_used} {generation.tokens_used === 1 ? 'token' : 'tokens'}
        </Badge>
        {hasSourceImage && (
          <Badge 
            className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm transition-opacity duration-300"
            variant={isHovered ? "default" : "secondary"}
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
    </div>
  );
}