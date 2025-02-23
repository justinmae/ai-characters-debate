import NewsDiscussion from '@/components/NewsDiscussion';
import { useDebate } from '@/hooks/useDebate';
import { useRef } from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { topic, isLoading, messages, isSpeaking, characters, startDebate } = useDebate();
  const transcriptRef = useRef<HTMLDivElement>(null);

  if (!characters.length) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4">
        {messages.length === 0 && (
          <Button onClick={startDebate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              'Start'
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <NewsDiscussion
      topic={topic}
      isLoading={isLoading}
      messages={messages}
      isSpeaking={isSpeaking}
      characters={characters}
      transcriptRef={transcriptRef}
      onStart={startDebate}
    />
  );
};

export default Index;
