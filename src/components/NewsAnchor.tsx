import { cn } from "../lib/utils";

interface NewsAnchorProps {
  name: string;
  isActive: boolean;
  lastMessage?: string;
  isSpeaking: boolean;
  avatarUrl?: string;
}

const NewsAnchor = ({ 
  name, 
  isActive, 
  lastMessage, 
  isSpeaking,
  avatarUrl 
}: NewsAnchorProps) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={cn(
        "relative w-40 h-40 rounded-full overflow-hidden bg-secondary",
        isSpeaking && "animate-[glow_2s_ease-in-out_infinite]"
      )}>
        {/* Pulsing ring animation when speaking */}
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full border-4 border-primary animate-[pulse-ring_2s_ease-in-out_infinite]" />
        )}
        
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name} 
            className={cn(
              "w-full h-full object-cover",
              isSpeaking && "scale-105 transition-transform duration-300"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-4xl font-semibold">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Status indicator */}
        {(isActive || isSpeaking) && (
          <div className={cn(
            "absolute bottom-2 right-2 w-6 h-6 rounded-full",
            isSpeaking ? "bg-primary animate-pulse" : "bg-primary"
          )} />
        )}
      </div>
      
      <h3 className={cn(
        "text-2xl font-semibold",
        isSpeaking && "text-primary"
      )}>{name}</h3>
      
      <p className="text-base text-muted-foreground">
        {isActive ? (
          <span className="inline-flex items-center">
            Preparing
            <span className="typing-animation ml-1">...</span>
          </span>
        ) : isSpeaking ? (
          <span className="inline-flex items-center text-primary animate-pulse">
            On Air
            <span className="typing-animation ml-1">...</span>
          </span>
        ) : 'Standing By'}
      </p>

      {lastMessage && (
        <div className="fixed bottom-0 left-0 w-full bg-black/80 py-2 text-white">
          <p className="text-sm news-ticker">
            {lastMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsAnchor;