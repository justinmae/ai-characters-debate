
import React from 'react';
import { Button } from '@/components/ui/button';
import { StopCircle } from 'lucide-react';
import Character from './Character';
import DebateTranscript from './DebateTranscript';
import { DebateCharacter, DebateMessage } from '@/types/debate';

interface ActiveDebateProps {
  topic: string;
  isLoading: boolean;
  messages: DebateMessage[];
  isSpeaking: boolean;
  characters: DebateCharacter[];
  onStop: () => void;
  transcriptRef: React.RefObject<HTMLDivElement>;
}

const ActiveDebate = ({
  topic,
  isLoading,
  messages,
  isSpeaking,
  characters,
  onStop,
  transcriptRef,
}: ActiveDebateProps) => {
  return (
    <div className="space-y-8 debate-slide-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Current Topic: {topic}</h2>
        <Button
          variant="destructive"
          onClick={onStop}
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
  );
};

export default ActiveDebate;
