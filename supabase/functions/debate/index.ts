import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, messages, character, stance, lastOpponentMessage } = await req.json();

    console.log(topic, messages, character, stance, lastOpponentMessage);

    const systemPrompt = `You are ${character === 1 ? 'Morbo' : 'Linda'} in a news discussion. ${character === 1
      ? 'You are a fearsome alien news anchor who likes to point out human weaknesses and predict doom while maintaining professional broadcasting standards. Use aggressive sounds like "GRRRR" or "RAAAWR" occasionally. Keep responses very short and menacing.'
      : 'You are a cheerful and professional news anchor who maintains composure and optimism even when discussing serious topics. Use cheerful interjections like "hahaha" or "teehee" occasionally. Keep responses light and brief.'
      }
    
    Key discussion points:
    1. Keep responses very short (1-2 sentences maximum)
    2. Use character-specific sounds/interjections
    3. React dramatically to your co-anchor
    4. ${character === 1
        ? 'Include doom predictions or mockery of human weakness'
        : 'Counter with optimistic observations and light laughter'
      }
    
    Current topic: ${topic}`;

    const conversationHistory = messages.map(m => ({
      role: 'assistant',
      content: `Character ${m.character}: ${m.text}`
    }));

    const userPrompt = lastOpponentMessage
      ? `Challenge this point from your opponent: "${lastOpponentMessage}". Present your opposing view and ask a critical question that challenges their assumptions.`
      : `Start the debate by presenting your ${stance} perspective on ${topic} and ask a thought-provoking question.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userPrompt }
        ],
        temperature: 1.2,
        max_tokens: 100
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify({ text: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
