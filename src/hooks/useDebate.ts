import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DebateCharacter, DebateMessage } from '@/types/debate';
import { playAudioFromBase64, stopAudio } from '@/utils/audio';
import { FIXED_CHARACTERS } from '@/constants/characters';
import { newsQueue } from '@/lib/news-queue';

export const useDebate = () => {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [characters, setCharacters] = useState<DebateCharacter[]>([]);
  const nextGenerationStarted = useRef(false);
  const nextResponseData = useRef<{ text: string; audio: string; character: number } | null>(null);
  const isStopping = useRef(false);
  const { toast } = useToast();
  const [currentNews, setCurrentNews] = useState(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const maxExchanges = useRef(Math.floor(Math.random() * 3) + 1);

  const initializeDebate = async () => {
    try {
      const news = await newsQueue.getCurrentNews();
      if (news) {
        setCurrentNews(news);
        setTopic(news.title);
      } else {
        console.error('No news available');
        toast({
          title: "Error",
          description: "No news available to discuss",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initializing debate:', error);
      toast({
        title: "Error",
        description: "Failed to initialize debate",
        variant: "destructive",
      });
    }
  };

  const startDebate = async () => {
    setCharacters(FIXED_CHARACTERS);
    await initializeDebate();
    setIsDebating(true);
    setIsLoading(true);
    setMessages([]);
    nextGenerationStarted.current = false;
    nextResponseData.current = null;

    const response = await generateDebateResponse(1, FIXED_CHARACTERS);
    if (response) {
      setIsLoading(false);
      await playMessage(response.text, response.audio, response.character, FIXED_CHARACTERS);
    }
  };

  const generateDebateResponse = async (characterNumber: number, currentCharacters: DebateCharacter[]) => {
    if (isStopping.current) return null;

    console.log('Generating debate response for character:', characterNumber);

    try {
      setIsLoading(true);
      const character = currentCharacters.find(c => c.character_number === characterNumber);
      if (!character) throw new Error('Character not found');

      const stance = characterNumber === 1 ? 'supportive' : 'critical';
      const { data, error } = await supabase.functions.invoke('debate', {
        body: {
          topic,
          messages,
          character: characterNumber,
          stance,
          characterInfo: {
            name: character.name,
            background: character.background,
            personality: character.personality,
            occupation: character.occupation
          },
          lastOpponentMessage: messages.length > 0 ? messages[messages.length - 1].text : null,
        },
      });

      if (error) throw error;
      if (!data.text) throw new Error('No response received');

      const { data: audioData, error: audioError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: data.text,
          voiceId: character.voice_id
        }
      });

      if (audioError) throw audioError;
      if (!audioData.audioContent) throw new Error('No audio content received');

      return {
        text: data.text,
        audio: audioData.audioContent,
        character: characterNumber
      };
    } catch (error) {
      console.error('Error generating debate response:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to generate debate response. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const playMessage = async (text: string, audio: string, characterNumber: number, currentCharacters: DebateCharacter[]) => {
    if (isStopping.current) return;

    console.log('Playing message for character:', characterNumber);

    try {
      setIsSpeaking(true);
      nextGenerationStarted.current = false;

      setMessages(prev => [...prev, { character: characterNumber, text }]);

      await playAudioFromBase64(audio, (progress) => {
        if (isStopping.current) return;

        if (progress >= 25 && !nextGenerationStarted.current && messages.length < 6) {
          nextGenerationStarted.current = true;
          generateDebateResponse(characterNumber === 1 ? 2 : 1, currentCharacters).then(response => {
            if (response && !isStopping.current) {
              nextResponseData.current = response;
            }
          });
        }
      });

      setIsSpeaking(false);
      setIsLoading(false);

      if (nextResponseData.current && messages.length < 6 && !isStopping.current) {
        const { text, audio, character } = nextResponseData.current;
        nextResponseData.current = null;
        await playMessage(text, audio, character, currentCharacters);
      }

      setExchangeCount(prev => prev + 1);
    } catch (error) {
      console.error('Error playing message:', error);
      setIsSpeaking(false);
      setIsLoading(false);
    }
  };

  return {
    topic,
    isDebating,
    isLoading,
    messages,
    isSpeaking,
    characters,
    startDebate
  };
};
