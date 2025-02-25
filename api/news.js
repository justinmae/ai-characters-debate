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

// Then apply CORS middleware for other requests
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
      const newsItems = await csvtojson({
        noheader: true,
        headers: ['title', 'description']
      }).fromString(csvText);

      if (!newsItems || newsItems.length === 0) {
        return res.json(fallbackNews);
      }

      // Filter out any invalid entries
      const validNews = newsItems.filter(item => 
        item && typeof item.title === 'string' && typeof item.description === 'string'
      );
      
      if (validNews.length === 0) {
        return res.json(fallbackNews);
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