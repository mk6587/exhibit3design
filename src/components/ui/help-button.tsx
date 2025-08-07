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
      className="fixed bottom-6 right-6 z-50 h-auto w-auto px-3 py-1.5 shadow-lg hover:shadow-xl transition-all duration-300 bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 backdrop-blur-md border border-purple-300/20 rounded-full text-xs font-medium"
    >
      Need help?
    </Button>
  );
};

export default HelpButton;