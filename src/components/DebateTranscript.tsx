
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { DebateMessage } from '@/types/debate';

interface DebateTranscriptProps {
  messages: DebateMessage[];
}

const DebateTranscript = ({ messages }: DebateTranscriptProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">
          Debate Transcript
        </h2>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto px-4">
        <div className="space-y-4">
          {[...messages].reverse().map((message, index) => (
            <div
              key={index}
              className={`flex ${message.character === 1 ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.character === 1
                    ? 'bg-blue-100 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
                    : 'bg-green-100 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
                } p-4 shadow-sm`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  message.character === 1 ? 'text-blue-700' : 'text-green-700'
                }`}>
                  Character {message.character}
                </div>
                <p className="text-sm text-gray-800">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebateTranscript;
