import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export const AIStudioCTA = () => {
  const [showFreeTokens, setShowFreeTokens] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowFreeTokens((prev) => !prev);
    }, 3000); // Switch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Button 
      variant="default" 
      size="sm" 
      asChild
      className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
    >
      <Link to="/auth">
        <Sparkles className="h-4 w-4 relative z-10" />
        <div className="relative h-5 w-40 overflow-hidden">
          <span 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              showFreeTokens 
                ? 'opacity-0 -translate-y-full' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            AI Studio
          </span>
          <span 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 whitespace-nowrap ${
              showFreeTokens 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-full'
            }`}
          >
            Get 5 Free AI Tokens
          </span>
        </div>
      </Link>
    </Button>
  );
};

export const AIStudioCTAMobile = () => {
  const [showFreeTokens, setShowFreeTokens] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowFreeTokens((prev) => !prev);
    }, 3000); // Switch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      asChild
      className="md:hidden relative hover:bg-muted flex items-center gap-1 px-2 overflow-hidden"
    >
      <Link to="/auth" className="flex items-center gap-1">
        <Sparkles className="h-4 w-4 text-purple-600 relative z-10" />
        <div className="relative h-5 w-24 overflow-hidden">
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
            5 Free Tokens
          </span>
        </div>
      </Link>
    </Button>
  );
};
