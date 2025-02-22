
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, User } from 'lucide-react';
import Character from './Character';
import TopicInput from './TopicInput';
import DebateTranscript from './DebateTranscript';

const DebateArena = () => {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [messages, setMessages] = useState<Array<{ character: number; text: string }>>([]);

  const startDebate = () => {
    if (!topic.trim()) return;
    setIsDebating(true);
    // Initialize debate with first message
    const initialMessage = {
      character: 1,
      text: `Let's discuss the topic: ${topic}. I believe we should start by considering the main aspects of this issue.`
    };
    setMessages([initialMessage]);
    simulateResponse();
  };

  const simulateResponse = () => {
    // For now, we'll just simulate responses. Later we'll integrate with AI
    setTimeout(() => {
      const newMessage = {
        character: messages.length % 2 === 0 ? 1 : 2,
        text: `This is a simulated response to continue the debate about ${topic}.`
      };
      setMessages((prev) => [...prev, newMessage]);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 debate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight">AI Character Debate</h1>
          <p className="text-muted-foreground">
            Watch two AI characters engage in an intellectual debate on your chosen topic
          </p>
        </div>

        {!isDebating && (
          <TopicInput topic={topic} setTopic={setTopic} onStart={startDebate} />
        )}

        {isDebating && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 debate-slide-in">
            <Character
              name="Character 1"
              isActive={messages.length % 2 === 0}
              lastMessage={messages.find(m => m.character === 1)?.text}
            />
            <Character
              name="Character 2"
              isActive={messages.length % 2 === 1}
              lastMessage={messages.find(m => m.character === 2)?.text}
            />
            <div className="md:col-span-2">
              <DebateTranscript messages={messages} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebateArena;
