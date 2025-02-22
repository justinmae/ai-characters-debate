
import React from 'react';
import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CharacterProps {
  name: string;
  isActive: boolean;
  lastMessage?: string;
  role: string;
  isSpeaking: boolean;
  age?: number;
  location?: string;
  occupation?: string;
  avatarUrl?: string;
}

const Character = ({ 
  name, 
  isActive, 
  lastMessage, 
  role, 
  isSpeaking,
  age,
  location,
  occupation,
  avatarUrl 
}: CharacterProps) => {
  return (
    <Card className={`character-container transition-all duration-300 ${isActive ? 'ring-2 ring-primary/20 animate-pulse' : ''}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className={`relative rounded-full transition-colors duration-300 ${isActive ? 'ring-2 ring-primary' : ''}`}>
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name} 
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className={`p-3 rounded-full ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
              <User className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {occupation || role}
          </p>
          {location && (
            <p className="text-xs text-muted-foreground">
              {location}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {isActive ? (
              <span className="inline-flex items-center">
                Thinking
                <span className="typing-animation ml-1">...</span>
              </span>
            ) : isSpeaking ? (
              <span className="inline-flex items-center text-primary">
                Speaking
                <span className="typing-animation ml-1">...</span>
              </span>
            ) : 'Waiting'}
          </p>
        </div>
      </div>
      {lastMessage && (
        <p className={`text-sm text-muted-foreground line-clamp-2 transition-opacity duration-500 ${isActive ? 'typing-text opacity-70' : 'opacity-100'}`}>
          {lastMessage}
        </p>
      )}
    </Card>
  );
};

export default Character;
