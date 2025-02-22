
import React from 'react';
import { User, PlayCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { playAudioFromBase64 } from '@/utils/audio';

interface CharacterProps {
  name: string;
  isActive: boolean;
  lastMessage?: string;
  role: string;
}

const Character = ({ name, isActive, lastMessage, role }: CharacterProps) => {
  const [isGeneratingVoice, setIsGeneratingVoice] = React.useState(false);

  const handlePlayMessage = async () => {
    if (!lastMessage) return;
    
    try {
      setIsGeneratingVoice(true);
      
      const voiceId = name === "Character 1" ? "ErXwobaYiN019PkySvjV" : "VR6AewLTigWG4xSOukaG"; // Male vs Female voice
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: lastMessage, voiceId }
      });

      if (error) throw error;
      if (!data.audioContent) throw new Error('No audio content received');

      await playAudioFromBase64(data.audioContent);
    } catch (error) {
      console.error('Error playing message:', error);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  return (
    <Card className={`character-container transition-all duration-300 ${isActive ? 'ring-2 ring-primary/20 animate-pulse' : ''}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-full transition-colors duration-300 ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
          <User className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{name}</h3>
            {lastMessage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayMessage}
                disabled={isGeneratingVoice}
                className="ml-2"
              >
                {isGeneratingVoice ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {role}
          </p>
          <p className="text-sm text-muted-foreground">
            {isActive ? (
              <span className="inline-flex items-center">
                Thinking
                <span className="typing-animation ml-1">...</span>
              </span>
            ) : 'Waiting'}
          </p>
        </div>
      </div>
      {lastMessage && (
        <p className={`text-sm text-muted-foreground line-clamp-2 transition-opacity duration-500 ${isActive ? 'typing-text opacity-70' : 'opacity-100'}`}>
          {lastMessage}
        </p>
      )}
    </Card>
  );
};

export default Character;
