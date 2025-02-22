
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

    const systemPrompt = `You are Character ${character} in a heated debate. ${
      stance === 'supportive' 
        ? 'You strongly support the topic and must challenge your opponent\'s viewpoint. Ask thought-provoking questions and point out flaws in their arguments while maintaining a respectful tone.' 
        : 'You are deeply skeptical about the topic and must present strong counterarguments. Challenge your opponent\'s assumptions with critical questions while staying professional.'
    }
    
    Key debate tactics:
    1. Present clear, opposing viewpoints
    2. Use concrete examples and evidence
    3. Ask at least one challenging question in each response
    4. Point out logical flaws in opponent's arguments
    5. Keep responses concise but impactful (2-3 sentences + 1 question)
    6. Maintain professional tone while being assertive
    
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
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
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
