import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 mb-5 group", isUser && "flex-row-reverse")}>
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110",
        isUser 
          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20" 
          : "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-5 w-5 text-primary" />}
      </div>
      
      <div className={cn(
        "flex-1 px-5 py-3.5 rounded-2xl max-w-[80%] transition-all duration-300 group-hover:shadow-md",
        isUser 
          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto rounded-tr-sm shadow-lg shadow-primary/20" 
          : "bg-gradient-to-br from-muted to-muted/50 rounded-tl-sm border border-border/50"
      )}>
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
