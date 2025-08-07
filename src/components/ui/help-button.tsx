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
      className="fixed bottom-6 right-6 z-50 h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/20 hover:bg-white/30 text-foreground backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center"
      size="icon"
    >
      <MessageCircle className="h-5 w-5" />
    </Button>
  );
};

export default HelpButton;