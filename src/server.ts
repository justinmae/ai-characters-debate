import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import csvtojson from 'csvtojson';
import textToSpeechRouter from './api/text-to-speech.js';

// Load environment variables from .env file in project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  'https://ai-characters-debate.vercel.app',
  'https://ai-characters-debate-6b93hwcrt-justinmaes-projects.vercel.app'
];

app.use(cors({
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
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log environment variable status
console.log('ELEVEN_LABS_API_KEY status:', process.env.ELEVEN_LABS_API_KEY ? 'Set' : 'Not set');

app.use('/api/text-to-speech', textToSpeechRouter);

// Add news API endpoint
app.get('/api/news', async (_req: express.Request, res: express.Response): Promise<void> => {
    try {
        const csvPath = path.join(process.cwd(), 'public', 'news_database.csv');

        if (!fs.existsSync(csvPath)) {
            res.status(404).json({
                error: 'News database file not found',
                title: 'Breaking: Technical Difficulties at AI News Network',
                description: 'Our AI anchors are experiencing temporary issues.'
            });
            return;
        }

        const csvText = fs.readFileSync(csvPath, 'utf-8');
        const news = await csvtojson({
            noheader: true,
            headers: ['title', 'description']
        }).fromString(csvText);

        if (!news || news.length === 0) {
            res.status(200).json({
                title: 'Breaking: Technical Difficulties at AI News Network',
                description: 'Our AI anchors are experiencing temporary issues.'
            });
            return;
        }

        const randomNews = news[Math.floor(Math.random() * news.length)];

        res.json({
            title: randomNews.title.replace(/^"|"$/g, ''),
            description: randomNews.description.replace(/^"|"$/g, '')
        });
    } catch (error) {
        console.error('Error in news API:', error);
        res.status(500).json({
            error: 'Internal server error',
            title: 'Breaking: Technical Difficulties at AI News Network',
            description: 'Our AI anchors are experiencing temporary issues.'
        });
    }
});

// Remove app.listen() for Vercel
export default app; 