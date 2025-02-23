import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';

const router = express.Router();

router.use(cors());
router.use(express.json());

const handler: RequestHandler = async (req, res, next) => {
    try {
        const { text, voiceId } = req.body;
        console.log('Received request:', { text, voiceId });

        if (!text || !voiceId) {
            res.status(400).json({ error: 'Text and voiceId are required' });
            return;
        }

        const apiKey = process.env.ELEVEN_LABS_API_KEY;
        if (!apiKey) {
            console.error('ELEVEN_LABS_API_KEY environment variable is not set');
            res.status(500).json({ error: 'ElevenLabs API key not configured' });
            return;
        }

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

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', errorText);
            res.status(response.status).json({
                error: 'ElevenLabs API error',
                details: errorText
            });
            return;
        }

        const audioData = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioData).toString('base64');
        res.json({ audioContent: base64Audio });
    } catch (error) {
        next(error);
    }
};

router.post('/', handler);

export default router; 