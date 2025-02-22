
import React from 'react';
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
    <Card className={`character-container ${isActive ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div 
          className={`relative w-12 h-12 rounded-full overflow-hidden bg-secondary ${
            isActive ? 'ring-2 ring-primary' : ''
          }`}
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-lg font-semibold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {(isActive || isSpeaking) && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary" />
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
        <p className={`text-sm text-muted-foreground line-clamp-2 ${
          isActive ? 'typing-text opacity-70' : 'opacity-100'
        }`}>
          {lastMessage}
        </p>
      )}
    </Card>
  );
};

export default Character;
