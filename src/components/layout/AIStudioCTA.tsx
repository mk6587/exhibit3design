import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AIStudioCTA = () => {
  const [showFreeTokens, setShowFreeTokens] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowFreeTokens((prev) => !prev);
    }, 5000); // Switch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      asChild
      className="hidden md:flex items-center gap-1.5 hover:bg-muted px-2 overflow-hidden"
    >
      <a href="https://ai.exhibit3design.com" target="_blank" rel="noopener noreferrer">
        <Sparkles className="h-4 w-4 text-purple-600 relative z-10" />
        <div className="relative h-5 w-32 overflow-hidden">
          <span 
            className={`absolute inset-0 flex items-center justify-start text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent transition-all duration-500 ${
              showFreeTokens 
                ? 'opacity-0 -translate-y-full' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            AI Studio
          </span>
          <span 
            className={`absolute inset-0 flex items-center justify-start text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent transition-all duration-500 whitespace-nowrap ${
              showFreeTokens 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-full'
            }`}
          >
            2 Free Tokens
          </span>
        </div>
      </a>
    </Button>
  );
};

export const AIStudioCTAMobile = () => {
  const [showFreeTokens, setShowFreeTokens] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowFreeTokens((prev) => !prev);
    }, 5000); // Switch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      asChild
      className="md:hidden relative hover:bg-muted flex items-center gap-1 px-2 overflow-hidden"
    >
      <a href="https://ai.exhibit3design.com" target="_blank" rel="noopener noreferrer">
        <Sparkles className="h-4 w-4 text-purple-600 relative z-10" />
        <div className="relative h-5 w-32 overflow-hidden">
          <span 
            className={`absolute inset-0 flex items-center justify-start text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent transition-all duration-500 ${
              showFreeTokens 
                ? 'opacity-0 -translate-y-full' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            AI Studio
          </span>
          <span 
            className={`absolute inset-0 flex items-center justify-start text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent transition-all duration-500 whitespace-nowrap ${
              showFreeTokens 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-full'
            }`}
          >
            2 Free Tokens
          </span>
        </div>
      </a>
    </Button>
  );
};
