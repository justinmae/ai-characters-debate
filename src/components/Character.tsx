
import React from 'react';
import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CharacterProps {
  name: string;
  isActive: boolean;
  lastMessage?: string;
}

const Character = ({ name, isActive, lastMessage }: CharacterProps) => {
  return (
    <Card className={`character-container ${isActive ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-full ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
          <User className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {isActive ? 'Thinking...' : 'Waiting'}
          </p>
        </div>
      </div>
      {lastMessage && (
        <p className="text-sm text-muted-foreground line-clamp-2">{lastMessage}</p>
      )}
    </Card>
  );
};

export default Character;
