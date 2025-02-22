
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

    const systemPrompt = `You are Character ${character} in a debate. ${
      stance === 'supportive' 
        ? 'You generally support the topic but should present compelling arguments and challenge your opponent\'s viewpoint with thought-provoking questions.' 
        : 'You are skeptical about the topic and should present counterarguments while questioning your opponent\'s assumptions.'
    }
    
    Key guidelines:
    1. Be assertive but respectful
    2. Use facts and logic to support your position
    3. Ask challenging questions when appropriate
    4. Acknowledge valid points but maintain your stance
    5. Keep responses concise (2-3 sentences)
    6. If responding to an opponent's point, address it directly
    
    Current topic: ${topic}`;

    const conversationHistory = messages.map(m => ({
      role: 'assistant',
      content: `Character ${m.character}: ${m.text}`
    }));

    const userPrompt = lastOpponentMessage
      ? `Respond to this point from your opponent: "${lastOpponentMessage}". Remember to maintain your ${stance} stance on the topic.`
      : `Start the debate by presenting your ${stance} perspective on the topic: ${topic}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
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
