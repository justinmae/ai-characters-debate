
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TopicInputProps {
  topic: string;
  setTopic: (topic: string) => void;
  onStart: () => void;
}

const TopicInput = ({ topic, setTopic, onStart }: TopicInputProps) => {
  return (
    <Card className="p-6 debate-slide-in">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Choose a Debate Topic</h2>
        <p className="text-sm text-muted-foreground">
          Enter any topic you'd like the AI characters to debate about
        </p>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter a topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1"
          />
          <Button onClick={onStart} disabled={!topic.trim()}>
            Start Debate
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TopicInput;
