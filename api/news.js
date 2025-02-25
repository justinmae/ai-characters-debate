// Serverless function for news API
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import csvtojson from 'csvtojson';

// Create a minimal Express application for this API endpoint
const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  'https://ai-characters-debate.vercel.app',
  'https://ai-characters-debate-6b93hwcrt-justinmaes-projects.vercel.app',
  'https://ai-characters-debate-git-fixserverissue-justinmaes-projects.vercel.app'
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

app.get('/', async (req, res) => {
  try {
    // Predefined fallback news in case there's an issue
    const fallbackNews = {
      title: 'Breaking: Technical Difficulties at AI News Network',
      description: 'Our AI anchors are experiencing temporary issues.'
    };

    try {
      // Try to access the news database from the public directory
      const csvPath = path.join(process.cwd(), 'public', 'news_database.csv');
      if (!fs.existsSync(csvPath)) {
        return res.json(fallbackNews);
      }

      const csvText = fs.readFileSync(csvPath, 'utf-8');
      const news = await csvtojson({
        noheader: true,
        headers: ['title', 'description']
      }).fromString(csvText);

      if (!news || news.length === 0) {
        return res.json(fallbackNews);
      }

      const randomNews = news[Math.floor(Math.random() * news.length)];

      res.json({
        title: randomNews.title.replace(/^"|"$/g, ''),
        description: randomNews.description.replace(/^"|"$/g, '')
      });
    } catch (error) {
      console.error('Error reading news file:', error);
      res.json(fallbackNews);
    }
  } catch (error) {
    console.error('Error in news API:', error);
    res.status(500).json({
      error: 'Internal server error',
      title: 'Breaking: Technical Difficulties at AI News Network',
      description: 'Our AI anchors are experiencing temporary issues.'
    });
  }
});

// Export a serverless function handler
export default function(req, res) {
  // Log the request for debugging
  console.log(`Received ${req.method} request to ${req.url}`);
  return app(req, res);
} 