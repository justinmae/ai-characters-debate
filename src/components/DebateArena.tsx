
import React, { useRef, useEffect } from 'react';
import { StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Character from './Character';
import TopicInput from './TopicInput';
import DebateTranscript from './DebateTranscript';
import { useDebate } from '@/hooks/useDebate';

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
        <div className="text-center space-y-4 debate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight">AI Character Debate</h1>
          <p className="text-muted-foreground">
            Watch two AI characters engage in an intellectual debate on your chosen topic
          </p>
        </div>

        {!isDebating ? (
          <TopicInput topic={topic} setTopic={setTopic} onStart={startDebate} />
        ) : (
          <div className="space-y-8 debate-slide-in">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Current Topic: {topic}</h2>
              <Button
                variant="destructive"
                onClick={stopDebate}
                className="flex items-center gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Stop Debate
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {characters.map((character) => (
                <Character
                  key={character.character_number}
                  name={character.name}
                  isActive={isLoading && messages.length % 2 === character.character_number - 1}
                  lastMessage={messages.find(m => m.character === character.character_number)?.text}
                  role={character.occupation}
                  isSpeaking={isSpeaking && messages[messages.length - 1]?.character === character.character_number}
                  age={character.age}
                  location={character.location}
                  occupation={character.occupation}
                  avatarUrl={character.avatar_url}
                />
              ))}
              <div className="md:col-span-2" ref={transcriptRef}>
                <DebateTranscript messages={messages} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebateArena;
