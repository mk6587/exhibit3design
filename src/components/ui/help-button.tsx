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
      className="fixed bottom-4 right-4 z-50 h-8 w-auto px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-300 bg-purple-500/30 hover:bg-purple-500/40 text-white backdrop-blur-md border border-purple-300/30 rounded-full text-xs font-medium"
      style={{ minWidth: 'fit-content' }}
    >
      Need help?
    </Button>
  );
};

export default HelpButton;