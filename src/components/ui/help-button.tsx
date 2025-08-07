import { MessageCircle } from "lucide-react";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

const HelpButton = () => {
  const handleHelpClick = () => {
    const message = encodeURIComponent("I need help with Exhibit3Design services");
    const whatsappUrl = `https://wa.me/1234567890?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      <span className="md:hidden text-xs bg-purple-500/20 backdrop-blur-md border border-purple-300/20 rounded-full px-2 py-1 text-purple-100">
        Need help?
      </span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleHelpClick}
              className="h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-300 bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 backdrop-blur-md border border-purple-300/20 rounded-full flex items-center justify-center"
              size="icon"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Need help? Chat with us!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default HelpButton;