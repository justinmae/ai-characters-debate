
import React from 'react';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface DebateTranscriptProps {
  messages: Array<{ character: number; text: string }>;
}

const DebateTranscript = ({ messages }: DebateTranscriptProps) => {
  return (
    <Card className="p-6 debate-fade-in">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Debate Transcript</h2>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto flex flex-col-reverse">
        <div className="space-y-4">
          {[...messages].reverse().map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.character === 1 ? 'bg-primary/5' : 'bg-secondary/50'
              } debate-fade-in`}
            >
              <div className="font-medium mb-1">Character {message.character}</div>
              <p className="text-sm text-muted-foreground">{message.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DebateTranscript;
