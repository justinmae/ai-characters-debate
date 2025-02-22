
import React, { useRef, useEffect } from 'react';
import { useDebate } from '@/hooks/useDebate';
import DebateHeader from './DebateHeader';
import TopicInput from './TopicInput';
import ActiveDebate from './ActiveDebate';

const DebateArena = () => {
  const {
    topic,
    setTopic,
    isDebating,
    isLoading,
    messages,
    isSpeaking,
    characters,
    startDebate,
    stopDebate
  } = useDebate();
  
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <DebateHeader />

        {!isDebating ? (
          <TopicInput topic={topic} setTopic={setTopic} onStart={startDebate} />
        ) : (
          <ActiveDebate
            topic={topic}
            isLoading={isLoading}
            messages={messages}
            isSpeaking={isSpeaking}
            characters={characters}
            onStop={stopDebate}
            transcriptRef={transcriptRef}
          />
        )}
      </div>
    </div>
  );
};

export default DebateArena;
