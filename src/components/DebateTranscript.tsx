
import React from 'react';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface DebateTranscriptProps {
  messages: Array<{ character: number; text: string }>;
}

const DebateTranscript = ({ messages }: DebateTranscriptProps) => {
  return (
    <Card className="p-6 debate-fade-in ai-border">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          Debate Transcript
        </h2>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto flex flex-col-reverse">
        <div className="space-y-4">
          {[...messages].reverse().map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.character === 1 
                  ? 'bg-gradient-to-r from-indigo-50/50 to-purple-50/50' 
                  : 'bg-gradient-to-r from-purple-50/50 to-indigo-50/50'
              } debate-fade-in ai-border`}
            >
              <div className="font-medium mb-1 text-indigo-700">Character {message.character}</div>
              <p className="text-sm text-muted-foreground">{message.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DebateTranscript;
