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
      className="fixed bottom-6 right-6 z-50 h-16 w-auto px-6 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center gap-3 min-w-[140px] md:h-14 md:px-5 md:py-3 md:text-sm"
      size="lg"
    >
      <MessageCircle className="h-6 w-6 md:h-5 md:w-5" />
      <span className="whitespace-nowrap">Need help?</span>
    </Button>
  );
};

export default HelpButton;