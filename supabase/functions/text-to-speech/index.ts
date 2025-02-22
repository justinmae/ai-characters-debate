
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { text, voiceId } = await req.json();
    console.log('Processing request for text:', text.substring(0, 50), '... with voiceId:', voiceId);

    if (!text) {
      throw new Error('Text is required');
    }

    const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!apiKey) {
      console.error('ELEVEN_LABS_API_KEY environment variable is not set');
      throw new Error('ElevenLabs API key not configured');
    }

    console.log('Making request to ElevenLabs API...');
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    });

    console.log('ElevenLabs response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error response:', errorText);
      
      // Check for specific error cases
      if (response.status === 401) {
        throw new Error('Invalid ElevenLabs API key');
      } else if (response.status === 429) {
        throw new Error('ElevenLabs API rate limit exceeded');
      }
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    console.log('Successfully received audio response');
    const audioData = await response.arrayBuffer();
    console.log('Audio data size:', audioData.byteLength, 'bytes');

    if (audioData.byteLength === 0) {
      throw new Error('Received empty audio data from ElevenLabs');
    }

    // Convert to base64 with chunking for large files
    const bytes = new Uint8Array(audioData);
    let base64 = '';
    const chunkSize = 32768;
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
      base64 += String.fromCharCode(...chunk);
    }
    
    const base64Audio = btoa(base64);
    console.log('Successfully encoded audio to base64');

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    // Send a more descriptive error response
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
