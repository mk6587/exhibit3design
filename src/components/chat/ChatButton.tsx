import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupportChatbot } from "./SupportChatbot";

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        data-chat-button
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-2xl z-40 hover:scale-110 transition-all duration-300 bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary/90 group animate-fade-in"
      >
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-3 w-3 md:h-3.5 md:w-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
      </Button>
      
      <SupportChatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
