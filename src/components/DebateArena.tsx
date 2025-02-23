import React, { useRef, useEffect } from 'react';
import { useDebate } from '@/hooks/useDebate';
import NewsHeader from './NewsHeader';
import TopicInput from './TopicInput';
import ActiveDebate from './ActiveDebate';

const DebateArena = () => {
  const {
    topic,
    isDebating,
    isLoading,
    messages,
    isSpeaking,
    characters,
  } = useDebate();
  
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = 0;
    }
  }, [messages]);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <NewsHeader />
        <ActiveDebate
          topic={topic}
          isLoading={isLoading}
          messages={messages}
          isSpeaking={isSpeaking}
          characters={characters}
          transcriptRef={transcriptRef}
        />
      </div>
    </div>
  );
};

export default DebateArena;
