import { MessageCircle } from "lucide-react";
import { Button } from "./button";

const HelpButton = () => {
  const handleHelpClick = () => {
    const message = encodeURIComponent("I need help with Exhibit3Design services");
    const whatsappUrl = `https://wa.me/1234567890?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleHelpClick}
      className="fixed bottom-6 right-6 z-50 h-12 w-auto px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 bg-white/20 hover:bg-white/30 text-foreground backdrop-blur-md border border-white/20 rounded-full flex items-center gap-2 min-w-[120px]"
      size="sm"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="whitespace-nowrap">Need help?</span>
    </Button>
  );
};

export default HelpButton;