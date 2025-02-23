import React from 'react';
import NewsAnchor from './NewsAnchor';
import NewsTranscript from './NewsTranscript';
import { DebateCharacter, DebateMessage } from '@/types/debate';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface NewsDiscussionProps {
  topic: string;
  isLoading: boolean;
  messages: DebateMessage[];
  isSpeaking: boolean;
  characters: DebateCharacter[];
  transcriptRef: React.RefObject<HTMLDivElement>;
  onStart: () => void;
}

const NewsDiscussion = ({
  topic,
  isLoading,
  messages,
  isSpeaking,
  characters,
  transcriptRef,
  onStart,
}: NewsDiscussionProps) => {
  if (!characters.length || !topic) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 debate-slide-in min-h-screen flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div 
          key={topic}
          className="flex justify-center items-center py-6 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center max-w-3xl mx-auto px-4">
            {topic}
          </h2>
        </motion.div>
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="flex gap-12 justify-center">
            {characters.map((character) => (
              <NewsAnchor
                key={character.character_number}
                name={character.name}
                isActive={isLoading && messages.length % 2 === character.character_number - 1}
                lastMessage={messages.find(m => m.character === character.character_number)?.text}
                isSpeaking={isSpeaking && messages[messages.length - 1]?.character === character.character_number}
                avatarUrl={character.avatar_url}
              />
            ))}
          </div>
        </div>
        
        {/* <div ref={transcriptRef}>
          <NewsTranscript messages={messages} />
        </div> */}
      </div>
    </div>
  );
};

export default NewsDiscussion; 