
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface TopicInputProps {
  topic: string;
  setTopic: (topic: string) => void;
  onStart: () => void;
  isLoading?: boolean;
}

const loadingMessages = [
  "Creating debate arena...",
  "Generating characters...",
  "Preparing debate stage...",
  "Starting the debate..."
];

const TopicInput = ({ topic, setTopic, onStart, isLoading = false }: TopicInputProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
      <Card className="p-6 debate-slide-in max-w-md w-full">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Choose a Debate Topic</h2>
          <p className="text-sm text-muted-foreground text-center">
            Enter any topic you'd like the AI characters to debate about
          </p>
          <div className="space-y-2">
            <Input
              placeholder="Enter a topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full"
            />
            <Button 
              onClick={onStart} 
              disabled={!topic.trim() || isLoading} 
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {loadingMessages[currentMessageIndex]}
                </>
              ) : (
                'Start Debate'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TopicInput;
