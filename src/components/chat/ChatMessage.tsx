import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import supportAgent from "@/assets/support-agent.png";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 mb-5 group", isUser && "flex-row-reverse")}>
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300",
        isUser 
          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20" 
          : "bg-white border-2 border-primary/20"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <img 
            src={supportAgent} 
            alt="Support Agent" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div className={cn(
        "flex-1 px-5 py-3.5 rounded-2xl transition-all duration-300",
        isUser 
          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm shadow-lg shadow-primary/20 max-w-[75%] ml-auto" 
          : "bg-gradient-to-br from-muted to-muted/50 rounded-tl-sm border border-border/50 max-w-[75%]"
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
