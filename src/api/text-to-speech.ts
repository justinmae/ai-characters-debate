import express, { type Request, type Response, type RequestHandler } from 'express';
import cors from 'cors';

const router = express.Router();

// Configure CORS for the router
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  'http://localhost:8080',
  'https://ai-characters-debate.vercel.app',
  'https://ai-characters-debate-6b93hwcrt-justinmaes-projects.vercel.app',
  'https://ai-characters-debate-git-fixserverissue-justinmaes-projects.vercel.app'
];

// Handle CORS preflight requests directly
router.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, X-Requested-With, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Respond with 204 No Content
  res.status(204).end();
});

router.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

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

// Add a GET handler for testing
router.get('/', (req, res) => {
    res.json({ status: 'Text-to-speech API is ready' });
});

router.post('/', handler);

export default router; 