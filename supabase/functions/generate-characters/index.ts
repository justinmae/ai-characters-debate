
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ELEVEN_LABS_VOICES = [
  "ThT5KcBeYPX3keUQqHPh", // Rachel
  "VR6AewLTigWG4xSOukaG", // Fin
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();

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
            content: `You are a character generator for a debate application. Create two contrasting characters who would have opposing views on the given topic. 
            Return the response in this exact JSON format:
            {
              "characters": [
                {
                  "name": "Full Name",
                  "age": number between 25-75,
                  "location": "City, Country",
                  "occupation": "Professional title",
                  "background": "2-3 sentences about their relevant experience and education",
                  "personality": "2-3 sentences about their character traits and debate style",
                  "character_number": 1,
                  "avatar_url": "https://avatars.dicebear.com/api/personas/" + encoded full name + ".svg"
                },
                {
                  "name": "Full Name",
                  "age": number between 25-75,
                  "location": "City, Country",
                  "occupation": "Professional title",
                  "background": "2-3 sentences about their relevant experience and education",
                  "personality": "2-3 sentences about their character traits and debate style",
                  "character_number": 2,
                  "avatar_url": "https://avatars.dicebear.com/api/personas/" + encoded full name + ".svg"
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Generate two contrasting characters who would have an interesting debate about: ${topic}`
          }
        ],
      }),
    });

    const data = await response.json();
    const characters = JSON.parse(data.choices[0].message.content);

    // Assign voice IDs to characters
    characters.characters[0].voice_id = ELEVEN_LABS_VOICES[0];
    characters.characters[1].voice_id = ELEVEN_LABS_VOICES[1];

    return new Response(JSON.stringify(characters), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-characters function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
