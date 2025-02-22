
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
    console.log('Generating humorous debate topic...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a witty debate topic generator. Generate ONE humorous, lighthearted, and slightly absurd debate topic that would be entertaining to discuss. The topic should be fun but still debatable from different perspectives. Keep it family-friendly and avoid controversial subjects. DO NOT use quotation marks in your response.',
          },
          {
            role: 'user',
            content: 'Generate a funny debate topic.',
          },
        ],
        temperature: 1,
      }),
    });

    const data = await response.json();
    const topic = data.choices[0].message.content.replace(/["']/g, '').trim();
    console.log('Generated topic:', topic);

    return new Response(
      JSON.stringify({ topic }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error generating topic:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate topic' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
