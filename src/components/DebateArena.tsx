
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Character from './Character';
import TopicInput from './TopicInput';
import DebateTranscript from './DebateTranscript';

const DebateArena = () => {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ character: number; text: string }>>([]);
  const { toast } = useToast();

  const generateDebateResponse = async (characterNumber: number) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('debate', {
        body: {
          topic,
          messages,
          character: characterNumber,
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

      // Generate response from the other character after a short delay
      if (messages.length < 6) { // Limit to 3 exchanges
        setTimeout(() => {
          generateDebateResponse(characterNumber === 1 ? 2 : 1);
        }, 1000);
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

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 debate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight">AI Character Debate</h1>
          <p className="text-muted-foreground">
            Watch two AI characters engage in an intellectual debate on your chosen topic
          </p>
        </div>

        {!isDebating && (
          <TopicInput topic={topic} setTopic={setTopic} onStart={startDebate} />
        )}

        {isDebating && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 debate-slide-in">
            <Character
              name="Character 1"
              isActive={isLoading && messages.length % 2 === 0}
              lastMessage={messages.find(m => m.character === 1)?.text}
            />
            <Character
              name="Character 2"
              isActive={isLoading && messages.length % 2 === 1}
              lastMessage={messages.find(m => m.character === 2)?.text}
            />
            <div className="md:col-span-2">
              <DebateTranscript messages={messages} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebateArena;
