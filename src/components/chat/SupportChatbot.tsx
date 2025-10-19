import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
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
            messages: [...messages, userMessage],
            messageCount: messages.length
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
    <Card className="fixed bottom-4 right-4 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col animate-scale-in border-primary/20 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-4 px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-primary/20">
        <CardTitle className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <div className="text-base font-semibold">Customer Support</div>
            <div className="text-xs text-muted-foreground font-normal">We typically reply instantly</div>
          </div>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-primary/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <ScrollArea className="flex-1 px-6 py-6" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className="animate-fade-in">
              <ChatMessage role={msg.role} content={msg.content} />
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 mb-4 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                <Bot className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="bg-gradient-to-br from-muted to-muted/50 px-5 py-4 rounded-2xl rounded-tl-sm border border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t border-primary/10 p-4 bg-background/95 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
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
              disabled={isLoading || !input.trim()}
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
