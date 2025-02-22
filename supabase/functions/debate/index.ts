
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, messages, character } = await req.json();

    // Define character personalities
    const characterPersonalities = {
      1: "You are a rational and analytical debater who relies on facts and logic. You communicate in a clear, structured manner and often cite evidence to support your arguments.",
      2: "You are a passionate and empathetic debater who considers emotional and human aspects. You communicate with conviction and often use real-world examples and analogies."
    };

    // Construct conversation history for context
    const conversationHistory = messages.map(msg => ({
      role: "assistant",
      content: msg.text,
      name: `character${msg.character}`
    }));

    // Add the system message for character personality
    const systemMessage = {
      role: "system",
      content: `${characterPersonalities[character]}. You are participating in a debate about: ${topic}. Keep your responses concise (max 2-3 sentences) and engaging. Maintain your unique perspective and personality throughout the debate.`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...conversationHistory],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OpenAI Response:', data);

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ text: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in debate function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
