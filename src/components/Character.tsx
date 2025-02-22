
import React from 'react';
import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CharacterProps {
  name: string;
  isActive: boolean;
  lastMessage?: string;
  role: string;
}

const Character = ({ name, isActive, lastMessage, role }: CharacterProps) => {
  return (
    <Card className={`character-container transition-all duration-300 ${isActive ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-full transition-colors duration-300 ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
          <User className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {role}
          </p>
          <p className="text-sm text-muted-foreground">
            {isActive ? (
              <span className="inline-flex">
                Thinking
                <span className="typing-animation">...</span>
              </span>
            ) : 'Waiting'}
          </p>
        </div>
      </div>
      {lastMessage && (
        <p className={`text-sm text-muted-foreground line-clamp-2 ${isActive ? 'typing-text' : ''}`}>
          {lastMessage}
        </p>
      )}
    </Card>
  );
};

export default Character;
