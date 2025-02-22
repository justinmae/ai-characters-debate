
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    const generateInitialTopics = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-topic');
        if (error) throw error;
        if (data.topics) {
          setTopics(data.topics);
          setTopic(data.topics[0]); // Set the first topic as default
        }
      } catch (error) {
        console.error('Error generating initial topics:', error);
      } finally {
        setIsGeneratingTopic(false);
      }
    };

    if (!topic) {
      generateInitialTopics();
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
          <p className="text-sm text-muted-foreground text-center mb-4">
            Select one of these controversial topics or enter your own
          </p>
          
          {isGeneratingTopic ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="h-6 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <RadioGroup
              value={topic}
              onValueChange={setTopic}
              className="space-y-3"
            >
              {topics.map((t, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={t} id={`topic-${index}`} />
                  <Label htmlFor={`topic-${index}`} className="text-sm">{t}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          <div className="space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">Or enter your own topic:</p>
            <Input 
              placeholder={isGeneratingTopic ? "Generating topics..." : "Enter a custom topic..."} 
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
                  Generating topics...
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
