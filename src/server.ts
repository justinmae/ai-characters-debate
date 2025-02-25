import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import csvtojson from 'csvtojson';
import textToSpeechRouter from './api/text-to-speech.js';

// ES Module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in project root
dotenv.config({ path: resolve(process.cwd(), '.env') });

const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  'http://localhost:8080',
  'https://ai-characters-debate.vercel.app',
  'https://ai-characters-debate-6b93hwcrt-justinmaes-projects.vercel.app',
  'https://ai-characters-debate-git-fixserverissue-justinmaes-projects.vercel.app'
];

// Handle CORS preflight requests directly
app.options('*', (req, res) => {
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
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// Log environment variable status
console.log('ELEVEN_LABS_API_KEY status:', process.env.ELEVEN_LABS_API_KEY ? 'Set' : 'Not set');

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    endpoints: ['/api/text-to-speech', '/api/news']
  });
});

// Mount the text-to-speech router
app.use('/api/text-to-speech', textToSpeechRouter);

// Add news API endpoint
app.get('/api/news', async (_req, res) => {
    try {
        const csvPath = join(process.cwd(), 'public', 'news_database.csv');

        if (!existsSync(csvPath)) {
            res.status(404).json({
                error: 'News database file not found',
                title: 'Breaking: Technical Difficulties at AI News Network',
                description: 'Our AI anchors are experiencing temporary issues.'
            });
            return;
        }

        const csvText = readFileSync(csvPath, 'utf-8');
        const newsItems = await csvtojson({
            noheader: true,
            headers: ['title', 'description']
        }).fromString(csvText);

        if (!newsItems || newsItems.length === 0) {
            res.status(200).json({
                title: 'Breaking: Technical Difficulties at AI News Network',
                description: 'Our AI anchors are experiencing temporary issues.'
            });
            return;
        }

        // Filter out any invalid entries
        const validNews = newsItems.filter(item => 
          item && typeof item.title === 'string' && typeof item.description === 'string'
        );
        
        if (validNews.length === 0) {
            res.status(200).json({
                title: 'Breaking: Technical Difficulties at AI News Network',
                description: 'Our AI anchors are experiencing temporary issues.'
            });
            return;
        }

        const randomNews = validNews[Math.floor(Math.random() * validNews.length)];

        // Safely process the strings
        const safeTitle = typeof randomNews.title === 'string' ? randomNews.title.replace(/^"|"$/g, '') : 'News headline unavailable';
        const safeDescription = typeof randomNews.description === 'string' ? randomNews.description.replace(/^"|"$/g, '') : 'News details unavailable';

        res.json({
            title: safeTitle,
            description: safeDescription
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