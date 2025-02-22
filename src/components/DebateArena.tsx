
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Character from './Character';
import TopicInput from './TopicInput';
import DebateTranscript from './DebateTranscript';

const DebateArena = () => {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ character: number; text: string }>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  const playMessage = async (text: string, characterNumber: number) => {
    try {
      const voiceId = characterNumber === 1 ? "ErXwobaYiN019PkySvjV" : "VR6AewLTigWG4xSOukaG";
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceId }
      });

      if (error) throw error;
      if (!data.audioContent) throw new Error('No audio content received');

      setIsSpeaking(true);
      await playAudioFromBase64(data.audioContent);
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error playing message:', error);
      setIsSpeaking(false);
    }
  };

  const generateDebateResponse = async (characterNumber: number) => {
    try {
      setIsLoading(true);
      const stance = characterNumber === 1 ? 'supportive' : 'critical';
      const { data, error } = await supabase.functions.invoke('debate', {
        body: {
          topic,
          messages,
          character: characterNumber,
          stance,
          lastOpponentMessage: messages.length > 0 ? messages[messages.length - 1].text : null,
        },
      });

      if (error) throw error;
      if (!data.text) throw new Error('No response received');

      const newMessage = {
        character: characterNumber,
        text: data.text
      };

      setMessages(prev => [...prev, newMessage]);
      setIsLoading(false);

      // Play the new message
      await playMessage(data.text, characterNumber);

      // Continue the debate if not finished
      if (messages.length < 6) { // Limit to 3 exchanges
        generateDebateResponse(characterNumber === 1 ? 2 : 1);
      }
    } catch (error) {
      console.error('Error generating debate response:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to generate debate response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startDebate = () => {
    if (!topic.trim()) return;
    setIsDebating(true);
    setMessages([]);
    generateDebateResponse(1); // Start with Character 1
  };

  const stopDebate = () => {
    setIsDebating(false);
    setMessages([]);
    setIsLoading(false);
    setTopic('');
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
              <Character
                name="Character 1"
                isActive={isLoading && messages.length % 2 === 0}
                lastMessage={messages.find(m => m.character === 1)?.text}
                role="Supportive Perspective"
                isSpeaking={isSpeaking && messages[messages.length - 1]?.character === 1}
              />
              <Character
                name="Character 2"
                isActive={isLoading && messages.length % 2 === 1}
                lastMessage={messages.find(m => m.character === 2)?.text}
                role="Critical Perspective"
                isSpeaking={isSpeaking && messages[messages.length - 1]?.character === 2}
              />
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
