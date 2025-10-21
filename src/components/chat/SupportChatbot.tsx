import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle, Paperclip, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import supportAgent from "@/assets/support-agent.png";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

interface SupportChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportChatbot = ({ isOpen, onClose }: SupportChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm here to help with any questions about Exhibit3Design. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
    // Alternative: smooth scroll to end element
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    let imageBase64 = null;
    if (selectedImage) {
      const reader = new FileReader();
      imageBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });
    }

    const userMessage: Message = { 
      role: "user", 
      content: input.trim() || "I've shared an image",
      imageUrl: imagePreview || undefined
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    removeImage();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/support-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && {
              'Authorization': `Bearer ${session.access_token}`
            })
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.imageUrl && imageBase64 ? [
                { type: "text", text: msg.content },
                { type: "image_url", image_url: { url: imageBase64 } }
              ] : msg.content
            })),
            messageCount: messages.length,
            hasImage: !!imageBase64
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage
                };
                return newMessages;
              });
            }
          } catch (e) {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting. Please try again or contact support@exhibit3design.com"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-0 right-0 md:bottom-4 md:right-4 w-full md:w-[400px] h-[100dvh] md:h-[600px] md:max-h-[calc(100vh-2rem)] shadow-2xl z-50 flex flex-col animate-scale-in border-primary/20 overflow-hidden md:rounded-lg rounded-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-3 md:pb-4 md:pt-4 px-4 md:px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-primary/20 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 md:gap-3">
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-primary/20 bg-white flex-shrink-0">
            <img 
              src={supportAgent} 
              alt="Support Agent" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-sm md:text-base font-semibold">Customer Support</div>
            <div className="text-xs text-muted-foreground font-normal hidden md:block">We typically reply instantly</div>
          </div>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-primary/10 transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <ScrollArea className="flex-1 px-4 py-4 md:px-6 md:py-6" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className="animate-fade-in">
              <ChatMessage role={msg.role} content={msg.content} imageUrl={msg.imageUrl} />
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 mb-4 animate-fade-in">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-white flex-shrink-0">
                <img 
                  src={supportAgent} 
                  alt="Support Agent" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-gradient-to-br from-muted to-muted/50 px-5 py-4 rounded-2xl rounded-tl-sm border border-border/50 max-w-[75%]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="border-t border-primary/10 p-3 md:p-4 bg-background/95 backdrop-blur-sm flex-shrink-0 safe-area-pb">
          {imagePreview && (
            <div className="mb-2 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-20 w-20 object-cover rounded-lg border-2 border-primary/20"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-11 w-11 border-primary/20 hover:bg-primary/10"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 h-11 border-primary/20 focus-visible:ring-primary/50 bg-background"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="h-11 w-11 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
