
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
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-indigo-50/20 to-white/90">
      <Card className="p-6 debate-slide-in max-w-md w-full ai-border ai-glow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Choose a Debate Topic
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Enter any topic you'd like the AI characters to debate about
          </p>
          <div className="space-y-2">
            <Input
              placeholder="Enter a topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/50 border-indigo-200/30 focus:border-indigo-300/50 transition-all"
            />
            <Button 
              type="submit"
              disabled={!topic.trim() || isLoading} 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
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
        </form>
      </Card>
    </div>
  );
};

export default TopicInput;
