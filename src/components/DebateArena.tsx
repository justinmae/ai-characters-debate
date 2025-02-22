
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { playAudioFromBase64, stopAudio } from '@/utils/audio';
import Character from './Character';
import TopicInput from './TopicInput';
import DebateTranscript from './DebateTranscript';

interface DebateCharacter {
  id?: number;
  name: string;
  age: number;
  location: string;
  occupation: string;
  background: string;
  personality: string;
  avatar_url: string;
  voice_id: string;
  character_number: number;
}

const DebateArena = () => {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ character: number; text: string; audio?: string }>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [characters, setCharacters] = useState<DebateCharacter[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const nextGenerationStarted = useRef(false);
  const nextResponseData = useRef<{ text: string; audio: string; character: number } | null>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  const generateDebateResponse = async (characterNumber: number) => {
    try {
      setIsLoading(true);
      const character = characters.find(c => c.character_number === characterNumber);
      if (!character) throw new Error('Character not found');

      const stance = characterNumber === 1 ? 'supportive' : 'critical';
      const { data, error } = await supabase.functions.invoke('debate', {
        body: {
          topic,
          messages,
          character: characterNumber,
          stance,
          characterInfo: {
            name: character.name,
            background: character.background,
            personality: character.personality,
            occupation: character.occupation
          },
          lastOpponentMessage: messages.length > 0 ? messages[messages.length - 1].text : null,
        },
      });

      if (error) throw error;
      if (!data.text) throw new Error('No response received');

      const { data: audioData, error: audioError } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: data.text, 
          voiceId: character.voice_id
        }
      });

      if (audioError) throw audioError;
      if (!audioData.audioContent) throw new Error('No audio content received');

      return {
        text: data.text,
        audio: audioData.audioContent,
        character: characterNumber
      };
    } catch (error) {
      console.error('Error generating debate response:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to generate debate response. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const playMessage = async (text: string, audio: string, characterNumber: number) => {
    try {
      setIsSpeaking(true);
      nextGenerationStarted.current = false;

      setMessages(prev => [...prev, { character: characterNumber, text }]);
      
      await playAudioFromBase64(audio, (progress) => {
        if (progress >= 25 && !nextGenerationStarted.current && messages.length < 6) {
          nextGenerationStarted.current = true;
          generateDebateResponse(characterNumber === 1 ? 2 : 1).then(response => {
            if (response) {
              nextResponseData.current = response;
            }
          });
        }
      });

      setIsSpeaking(false);
      setIsLoading(false);

      if (nextResponseData.current && messages.length < 6) {
        const { text, audio, character } = nextResponseData.current;
        nextResponseData.current = null;
        await playMessage(text, audio, character);
      }
    } catch (error) {
      console.error('Error playing message:', error);
      setIsSpeaking(false);
      setIsLoading(false);
    }
  };

  const generateCharacters = async (topic: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-characters', {
        body: { topic },
      });

      if (error) throw error;
      if (!data.characters) throw new Error('No characters received');

      return data.characters;
    } catch (error) {
      console.error('Error generating characters:', error);
      toast({
        title: "Error",
        description: "Failed to generate debate characters. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const startDebate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    const generatedCharacters = await generateCharacters(topic);
    
    if (!generatedCharacters) {
      setIsLoading(false);
      return;
    }

    setCharacters(generatedCharacters);
    setIsDebating(true);
    setMessages([]);
    nextGenerationStarted.current = false;
    nextResponseData.current = null;

    const response = await generateDebateResponse(1);
    if (response) {
      setIsLoading(false);
      await playMessage(response.text, response.audio, response.character);
    }
  };

  const stopDebate = () => {
    stopAudio(500);
    setIsDebating(false);
    setMessages([]);
    setIsLoading(false);
    setTopic('');
    setCharacters([]);
    nextGenerationStarted.current = false;
    nextResponseData.current = null;
  };

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
