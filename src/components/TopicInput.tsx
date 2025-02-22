
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TopicInputProps {
  topic: string;
  setTopic: (topic: string) => void;
  onStart: () => void;
  isLoading?: boolean;
}

const loadingMessages = ["Creating debate arena...", "Generating characters...", "Preparing debate stage...", "Starting the debate..."];

const TopicInput = ({
  topic,
  setTopic,
  onStart,
  isLoading = false
}: TopicInputProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(true);

  useEffect(() => {
    const generateInitialTopic = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-topic');
        if (error) throw error;
        if (data.topic) {
          setTopic(data.topic);
        }
      } catch (error) {
        console.error('Error generating initial topic:', error);
      } finally {
        setIsGeneratingTopic(false);
      }
    };

    if (!topic) {
      generateInitialTopic();
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onStart();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-transparent">
      <Card className="p-6 debate-slide-in max-w-md w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-center">
            Choose a Debate Topic
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Enter any topic you'd like the AI characters to debate about
          </p>
          <div className="space-y-2">
            <Input 
              placeholder={isGeneratingTopic ? "Generating topic..." : "Enter a topic..."} 
              value={topic} 
              onChange={e => setTopic(e.target.value)} 
              className="w-full"
              disabled={isGeneratingTopic}
            />
            <Button 
              type="submit" 
              disabled={!topic.trim() || isLoading || isGeneratingTopic} 
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {loadingMessages[currentMessageIndex]}
                </>
              ) : isGeneratingTopic ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Generating topic...
                </>
              ) : (
                'Start Debate'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TopicInput;
